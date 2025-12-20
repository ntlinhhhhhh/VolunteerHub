import React, { useEffect, useState, useCallback } from "react";
import { 
    FaArrowLeft, FaSave, FaMapMarkerAlt, FaCalendarAlt, 
    FaInfoCircle, FaUsers, FaTag, FaClipboardCheck, FaUserFriends, FaSignOutAlt, FaClipboardList, FaLayerGroup, 
    FaPaperPlane, FaTrash,
    FaChartBar
} from 'react-icons/fa';
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const COLORS = {
    PRIMARY: '#1A73E8', DARK_NAVY: '#202124', BACKGROUND: '#F1F3F4', CARD_BG: '#FFFFFF',
    BORDER: '#DADCE0', TEXT_MAIN: '#3C4043', TEXT_SECONDARY: '#5F6368', DANGER: '#D93025',
    WHITE: '#FFFFFF', SIDEBAR_BG: '#FFFFFF', SIDEBAR_BORDER: '#DADCE0', LIGHT_PRIMARY: '#E8F0FE',
};

const EditEvent: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState<any>({
        title: "",
        description: "",
        location: { address: "", city: "", district: "" },
        schedule: { startDate: "", endDate: "", registrationDeadline: "" },
        requirements: { minAge: 16, maxAge: 55, skills: [], experience: "", healthRequirements: "" },
        capacity: { maxVolunteers: 0, minVolunteers: 0 },
        roles: [] as any[],
        tags: [] as string[]
    });

    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
            const result = await res.json();
            if (result.success) setUser(result.data);
        } catch (err) { console.error(err); }
    }, []);

    const fetchEventDetail = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                const d = result.data;
                const formatDate = (isoStr: string) => isoStr ? new Date(isoStr).toISOString().slice(0, 16) : "";
                
                setFormData({
                    title: d.title,
                    description: d.description,
                    location: d.location,
                    schedule: {
                        startDate: formatDate(d.schedule.startDate),
                        endDate: formatDate(d.schedule.endDate),
                        registrationDeadline: formatDate(d.schedule.registrationDeadline),
                    },
                    requirements: {
                        ...d.requirements,
                        healthRequirements: d.requirements.healthRequirements || ""
                    },
                    capacity: d.capacity, // Lấy về cả currentVolunteers để hiển thị nếu cần, nhưng lúc gửi sẽ lọc ra
                    roles: d.roles || [],
                    tags: d.tags || []
                });
            }
        } catch (err) { console.error(err); } finally { setFetching(false); }
    }, [id]);

    useEffect(() => {
        fetchUserProfile();
        fetchEventDetail();
    }, [fetchUserProfile, fetchEventDetail]);

    const handleRoleChange = (index: number, field: string, value: any) => {
        const newRoles = [...formData.roles];
        newRoles[index] = { ...newRoles[index], [field]: value };
        setFormData({ ...formData, roles: newRoles });
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     const token = localStorage.getItem("accessToken");

    //     // XỬ LÝ PAYLOAD: Loại bỏ categoryId và currentVolunteers
    //     const { categoryId, capacity, ...restPayload } = formData;
    //     const { currentVolunteers, ...cleanCapacity } = capacity;
        
    //     const finalPayload = {
    //         ...restPayload,
    //         capacity: cleanCapacity
    //     };

    //     try {
    //         const res = await fetch(`${API_BASE_URL}/events/${id}`, {
    //             method: "PUT",
    //             headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    //             body: JSON.stringify(finalPayload)
    //         });
    //         const result = await res.json();
    //         if (res.ok && result.success) {
    //             alert("Cập nhật thành công!");
    //             navigate("/manager/my-events");
    //         } else { alert(result.message || "Có lỗi xảy ra"); }
    //     } catch (err) { alert("Lỗi kết nối"); } finally { setLoading(false); }
    // };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        // 1. Loại bỏ categoryId và tách capacity
        const { categoryId, capacity, roles, ...restPayload } = formData;

        // 2. Làm sạch capacity: loại bỏ currentVolunteers
        const { currentVolunteers, ...cleanCapacity } = capacity;

        // 3. Làm sạch roles: Backend báo lỗi nếu có "id" và "filled"
        // Chúng ta chỉ giữ lại: name, description, slots
        const cleanRoles = roles.map((role: any) => ({
            name: role.name,
            description: role.description,
            slots: Number(role.slots)
        }));

        const finalPayload = {
            ...restPayload,
            capacity: cleanCapacity,
            roles: cleanRoles
        };

        console.log("Payload gửi đi:", finalPayload); // Bạn có thể check log để đảm bảo sạch sẽ

        try {
            const res = await fetch(`${API_BASE_URL}/events/${id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(finalPayload)
            });
            const result = await res.json();
            
            if (res.ok && result.success) {
                alert("Cập nhật thành công!");
                navigate("/manager/my-events");
            } else { 
                // Hiển thị lỗi chi tiết từ backend nếu có
                console.error("Lỗi Validation:", result.message);
                alert(typeof result.message === 'object' ? "Dữ liệu không hợp lệ (kiểm tra console)" : result.message); 
            }
        } catch (err) { 
            alert("Lỗi kết nối"); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleSubmitForApproval = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn gửi duyệt?")) return;
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/events/${id}/submit`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                alert("Đã gửi duyệt!");
                navigate("/manager/my-events");
            } else { alert(result.message || "Lỗi khi gửi"); }
        } catch (err) { alert("Lỗi kết nối server"); } finally { setLoading(false); }
    };

    if (fetching) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: COLORS.BACKGROUND }}>
            <aside style={styles.sidebar}>
                <div style={{ padding: '30px 24px', borderBottom: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                    <h1 style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: COLORS.DARK_NAVY }}><FaUsers color={COLORS.PRIMARY} /> Manager</h1>
                </div>
                <nav style={{ flex: 1, padding: '20px 12px' }}>
                    <div onClick={() => navigate("/manager/statistics")} style={styles.navItem}>
                                            <FaChartBar style={{ marginRight: '12px' }} /> Statistics
                                        </div>
                    <div onClick={() => navigate("/manager/pending-applications")} style={styles.navItem}><FaClipboardList style={{ marginRight: '12px' }} /> Pending Applications</div>
                    <div onClick={() => navigate("/manager/my-events")} style={{ ...styles.navItem, backgroundColor: 'rgba(26, 115, 232, 0.15)', color: COLORS.PRIMARY }}><FaLayerGroup style={{ marginRight: '12px' }} /> My Events</div>
                </nav>
            </aside>

            <main style={{ marginLeft: '280px', flex: 1, padding: '40px' }}>
                <header style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate(-1)} style={styles.iconBtn}><FaArrowLeft /></button>
                    <h1 style={{ margin: 0, fontSize: '26px', color: COLORS.TEXT_MAIN }}>Chỉnh sửa sự kiện</h1>
                </header>

                <form onSubmit={handleSubmit} style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
                    
                    <div style={styles.card}>
                        <h3 style={{ ...styles.cardHeader, color: COLORS.PRIMARY }}><FaInfoCircle /> Thông tin chung</h3>
                        <label style={styles.label}>Tiêu đề</label>
                        <input required style={styles.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        
                        <label style={{ ...styles.label, marginTop: '15px' }}>Tags (cách nhau bởi dấu phẩy)</label>
                        <input style={styles.input} value={formData.tags.join(', ')} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})} />

                        <label style={{ ...styles.label, marginTop: '15px' }}>Mô tả</label>
                        <textarea required style={{ ...styles.input, minHeight: '100px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <div style={styles.card}>
                        <h3 style={{ ...styles.cardHeader, color: COLORS.PRIMARY }}><FaMapMarkerAlt /> Địa điểm</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div><label style={styles.label}>Thành phố</label><input style={styles.input} value={formData.location.city} onChange={e => setFormData({...formData, location: {...formData.location, city: e.target.value}})} /></div>
                            <div><label style={styles.label}>Quận/Huyện</label><input style={styles.input} value={formData.location.district} onChange={e => setFormData({...formData, location: {...formData.location, district: e.target.value}})} /></div>
                            <div><label style={styles.label}>Địa chỉ cụ thể</label><input style={styles.input} value={formData.location.address} onChange={e => setFormData({...formData, location: {...formData.location, address: e.target.value}})} /></div>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={{ ...styles.cardHeader, color: COLORS.PRIMARY }}><FaCalendarAlt /> Thời gian</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div><label style={styles.label}>Ngày bắt đầu</label><input type="datetime-local" style={styles.input} value={formData.schedule.startDate} onChange={e => setFormData({...formData, schedule: {...formData.schedule, startDate: e.target.value}})} /></div>
                            <div><label style={styles.label}>Ngày kết thúc</label><input type="datetime-local" style={styles.input} value={formData.schedule.endDate} onChange={e => setFormData({...formData, schedule: {...formData.schedule, endDate: e.target.value}})} /></div>
                            <div><label style={styles.label}>Hạn đăng ký</label><input type="datetime-local" style={styles.input} value={formData.schedule.registrationDeadline} onChange={e => setFormData({...formData, schedule: {...formData.schedule, registrationDeadline: e.target.value}})} /></div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={styles.card}>
                            <h3 style={{ ...styles.cardHeader, color: COLORS.PRIMARY }}><FaClipboardCheck /> Yêu cầu</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div><label style={styles.label}>Tuổi tối thiểu</label><input type="number" style={styles.input} value={formData.requirements.minAge} onChange={e => setFormData({...formData, requirements: {...formData.requirements, minAge: parseInt(e.target.value)}})} /></div>
                                <div><label style={styles.label}>Tuổi tối đa</label><input type="number" style={styles.input} value={formData.requirements.maxAge} onChange={e => setFormData({...formData, requirements: {...formData.requirements, maxAge: parseInt(e.target.value)}})} /></div>
                            </div>
                            <label style={{ ...styles.label, marginTop: '10px' }}>Sức khỏe</label>
                            <input style={styles.input} value={formData.requirements.healthRequirements} onChange={e => setFormData({...formData, requirements: {...formData.requirements, healthRequirements: e.target.value}})} />
                            <label style={{ ...styles.label, marginTop: '10px' }}>Kinh nghiệm</label>
                            <input style={styles.input} value={formData.requirements.experience} onChange={e => setFormData({...formData, requirements: {...formData.requirements, experience: e.target.value}})} />
                        </div>

                        <div style={styles.card}>
                            <h3 style={{ ...styles.cardHeader, color: COLORS.PRIMARY }}><FaUserFriends /> TNV (Capacity)</h3>
                            <label style={styles.label}>Số lượng tối thiểu</label>
                            <input type="number" style={styles.input} value={formData.capacity.minVolunteers} onChange={e => setFormData({...formData, capacity: {...formData.capacity, minVolunteers: parseInt(e.target.value)}})} />
                            <label style={{ ...styles.label, marginTop: '10px' }}>Số lượng tối đa</label>
                            <input type="number" style={styles.input} value={formData.capacity.maxVolunteers} onChange={e => setFormData({...formData, capacity: {...formData.capacity, maxVolunteers: parseInt(e.target.value)}})} />
                            {/* {formData.capacity.currentVolunteers !== undefined && (
                                <p style={{ fontSize: '12px', color: COLORS.PRIMARY, marginTop: '10px' }}>Đã đăng ký: {formData.capacity.currentVolunteers}</p>
                            )} */}
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={{ ...styles.cardHeader, color: COLORS.PRIMARY }}><FaUsers /> Vai trò</h3>
                        {formData.roles.map((role: any, idx: number) => (
                            <div key={idx} style={{ padding: '15px', border: `1px solid ${COLORS.BORDER}`, borderRadius: '8px', marginBottom: '15px', backgroundColor: '#F8F9FA' }}>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                                    <div style={{ flex: 2 }}>
                                        <label style={styles.label}>Tên vai trò</label>
                                        <input required style={styles.input} value={role.name} onChange={e => handleRoleChange(idx, 'name', e.target.value)} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={styles.label}>Slots</label>
                                        <input type="number" style={styles.input} value={role.slots} onChange={e => handleRoleChange(idx, 'slots', parseInt(e.target.value))} />
                                    </div>
                                    <button type="button" onClick={() => setFormData({...formData, roles: formData.roles.filter((_: any, i: number) => i !== idx)})} style={{...styles.deleteBtn, marginTop: '25px'}}><FaTrash /></button>
                                </div>
                                <label style={styles.label}>Mô tả</label>
                                <textarea required style={{ ...styles.input, minHeight: '60px' }} value={role.description} onChange={e => handleRoleChange(idx, 'description', e.target.value)} />
                            </div>
                        ))}
                        <button type="button" onClick={() => setFormData({...formData, roles: [...formData.roles, {name: "", description: "", slots: 1}]})} style={styles.addBtn}>+ Thêm vai trò</button>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>Hủy bỏ</button>
                        <button type="submit" disabled={loading} style={styles.submitBtn}>
                            <FaSave /> {loading ? "Đang lưu..." : "Cập nhật sự kiện"}
                        </button>
                        <button type="button" onClick={handleSubmitForApproval} disabled={loading} style={styles.submitApprovalBtn}>
                            <FaPaperPlane /> Gửi duyệt Admin
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

const styles = {
    sidebar: { width: '280px', position: 'fixed', height: '100vh', backgroundColor: COLORS.SIDEBAR_BG, color:COLORS.TEXT_MAIN,  borderRight: `1px solid ${COLORS.SIDEBAR_BORDER}`, display: 'flex', flexDirection: 'column' } as React.CSSProperties,
    navItem: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginBottom: '4px' } as React.CSSProperties,
    card: { backgroundColor: COLORS.CARD_BG, padding: '24px', borderRadius: '16px', border: `1px solid ${COLORS.BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } as React.CSSProperties,
    cardHeader: { margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' } as React.CSSProperties,
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.BORDER}`, fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#F8F9FA' , color: COLORS.TEXT_MAIN} as React.CSSProperties,
    label: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: COLORS.TEXT_SECONDARY },
    submitBtn: { padding: '14px 30px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    cancelBtn: { padding: '14px 30px', backgroundColor: '#E8EAED', color: COLORS.TEXT_MAIN, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' } as React.CSSProperties,
    iconBtn: { padding: 0, width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: COLORS.WHITE, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
    submitApprovalBtn: { padding: '14px 25px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)' } as React.CSSProperties,
    addBtn: { background: 'none', border: `1px dashed ${COLORS.PRIMARY}`, color: COLORS.PRIMARY, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', marginTop: '10px' } as React.CSSProperties,
    deleteBtn: { padding: '12px', backgroundColor: '#FCE8E6', color: COLORS.DANGER, border: 'none', borderRadius: '8px', cursor: 'pointer', height: '45px', display: 'flex', alignItems: 'center' } as React.CSSProperties,
};

export default EditEvent;