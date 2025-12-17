import { useState, type ChangeEvent } from "react";

const CreateEvent: React.FC = () => {
    const [jsonData, setJsonData] = useState<string>(`{
  "title": "Workshop 'Màu Sắc Cho Cuộc Sống'",
  "description": "Tổ chức chuỗi buổi vẽ tranh và thủ công cho trẻ em khuyết tật. Mục tiêu là tạo ra môi trường sáng tạo, hỗ trợ phát triển kỹ năng tinh thần và vận động cho các em, sau đó tổ chức bán đấu giá tác phẩm để gây quỹ.",
  "categoryId": "693ec515b0cb8e6693bf3c19",
  "location": {
    "address": "Trung tâm phục hồi chức năng người khuyết tật Hà Nội",
    "city": "Hà Nội",
    "district": "Thanh Xuân"
  },
  "schedule": {
    "startDate": "2025-12-18T8:00:00.000Z",
    "endDate": "2025-12-18T18:00:00.000Z",
    "registrationDeadline": "2025-12-17T16:00:00.000Z"
  },
  "requirements": {
    "minAge": 16,
    "maxAge": 50,
    "skills": ["Kỹ năng hội họa cơ bản", "Kiên nhẫn", "Làm việc với trẻ em đặc biệt"],
    "experience": "Ưu tiên sinh viên ngành nghệ thuật, sư phạm hoặc công tác xã hội",
    "healthRequirements": "Sức khỏe tốt"
  },
  "capacity": {
    "maxVolunteers": 30,
    "minVolunteers": 15
  },
  "roles": [
    { "name": "Giáo viên mỹ thuật", "description": "Hướng dẫn kỹ thuật vẽ và tổ chức lớp học", "slots": 5 },
    { "name": "Trợ lý hỗ trợ cá nhân", "description": "Giúp đỡ các em khuyết tật trong quá trình tham gia", "slots": 20 },
    { "name": "Hậu cần và Tổ chức đấu giá", "description": "Chuẩn bị vật liệu, địa điểm và tổ chức sự kiện gây quỹ", "slots": 5 }
  ],
  "images": [],
  "videos": [],
  "visibility": "public",
  "tags": ["nghệ thuật", "người khuyết tật", "gây quỹ", "trẻ em"]
}`);

    const [token, setToken] = useState<string>("");
    const [images, setImages] = useState<FileList | null>(null);
    const [response, setResponse] = useState<string>("");

    // Convert JSON object -> FormData (flatten)
    const objectToFormData = (
        obj: Record<string, any>,
        formData: FormData,
        parentKey?: string
    ) => {
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const formKey = parentKey ? `${parentKey}[${key}]` : key;

            if (
                value !== null &&
                typeof value === "object" &&
                !(value instanceof File)
            ) {
                objectToFormData(value, formData, formKey);
            } else {
                formData.append(formKey, value);
            }
        });
    };

    const sendData = async (): Promise<void> => {
        try {
            setResponse("⏳ Đang gửi request...");

            const parsed = JSON.parse(jsonData);
            const formData = new FormData();

            objectToFormData(parsed, formData);

            if (images) {
                Array.from(images).forEach((file) => {
                    formData.append("images", file);
                });
            }

            const res = await fetch("http://localhost:8000/events", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // ❌ KHÔNG set Content-Type
                },
                body: formData,
            });

            const data = await res.json();
            setResponse(JSON.stringify(data, null, 2));

            if (!res.ok) {
                alert("❌ API Error");
            } else {
                alert("✅ Thành công");
            }

            const eventId = data.data.id;

            const resSubmit = await fetch(
                `http://localhost:8000/events/${eventId}/submit`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!resSubmit.ok) {
                alert("❌ API Error");
            } else {
                alert("✅ Submit thành công");
            }

        } catch (err: any) {
            console.error(err);
            setResponse("❌ Failed to fetch (CORS hoặc backend chưa chạy)");
        }
    };

    return (
        <div
            style={{
                padding: 20,
                maxWidth: 900,
                margin: "auto",
                fontFamily: "sans-serif",
            }}
        >
            <h2>React TSX – Upload Event Test (Port 5173)</h2>

            <label><b>JSON Body</b></label>
            <textarea
                rows={15}
                style={{ width: "100%" }}
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
            />

            <br /><br />

            <label><b>Upload Images</b></label><br />
            <input
                type="file"
                multiple
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setImages(e.target.files)
                }
            />

            <br /><br />

            <label><b>JWT Token</b></label>
            <input
                type="text"
                style={{ width: "100%" }}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste JWT here"
            />

            <br /><br />

            <button
                onClick={sendData}
                style={{
                    padding: "10px 20px",
                    background: "#007bff",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                Gửi Request
            </button>

            <h3>Response</h3>
            <pre style={{ background: "#f4f4f4", padding: 10 }}>
                {response}
            </pre>
        </div>
    );
};

export default CreateEvent;
