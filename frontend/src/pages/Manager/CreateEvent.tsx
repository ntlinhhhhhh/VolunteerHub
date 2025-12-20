import React, { useEffect, useState, useCallback } from "react";
import {
    FaPlus, FaTrash, FaArrowLeft, FaUsers, FaSignOutAlt, FaCalendarAlt, 
    FaMapMarkerAlt, FaClipboardList, FaInfoCircle, FaCheckCircle, FaTag, FaClipboardCheck, FaUserFriends,
    FaPaperPlane
} from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const COLORS = {
    PRIMARY: '#1A73E8', 
    DARK_NAVY: '#202124', 
    BACKGROUND: '#F1F3F4', 
    CARD_BG: '#FFFFFF', 
    BORDER: '#DADCE0', 
    TEXT_MAIN: '#3C4043',
    TEXT_SECONDARY: '#5F6368', 
    DANGER: '#D93025', 
    SUCCESS_ACCENT: '#188038', 
    WHITE: '#FFFFFF',
    LIGHT_PRIMARY: '#E8F0FE', 
    SIDEBAR_BG: '#FFFFFF', 
    SIDEBAR_TEXT: '#3C4043', 
    SIDEBAR_BORDER: '#DADCE0', 
};

const CreateEvent: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]); // State lưu danh sách category

    // Form State mapping chính xác với API Body bạn cung cấp
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "", // Để trống ban đầu hoặc set default
        location: { address: "", city: "", district: "" },
        schedule: { startDate: "", endDate: "", registrationDeadline: "" },
        requirements: {
            minAge: 16,
            maxAge: 60,
            skills: [] as string[],
            experience: "Không yêu cầu kinh nghiệm, sẽ được hướng dẫn tại chỗ",
            healthRequirements: ""
        },
        capacity: { maxVolunteers: 40, minVolunteers: 15 },
        roles: [{ name: "", description: "", slots: 10 }],
        visibility: "public",
        tags: [] as string[],
        images: [],
        videos: []
    });

    // --- LOGIC FETCH CATEGORIES ---
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/categories?activeOnly=true`);
            const result = await res.json();
            if (result.success) {
                setCategories(result.data);
                if (result.data.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: result.data[0].id }));
                }
            }
        } catch (err) { console.error("Error fetching categories:", err); }
    }, []);

    // --- LOGIC AUTH (Giống Dashboard) ---
    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) { navigate("/manager/login"); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
            const result = await res.json();
            if (result.success) {
                const userData = result.data;
                userData.avatar = userData.avatar ? (userData.avatar.startsWith('http') ? userData.avatar : `${API_BASE_URL}${userData.avatar}`) : `https://ui-avatars.com/api/?name=${userData.username}&background=random`;
                setUser(userData);
            }
        } catch (err) { console.error(err); }
    }, [navigate]);

    useEffect(() => { 
        fetchUserProfile(); 
        fetchCategories(); // Gọi fetch categories khi mount
    }, [fetchUserProfile, fetchCategories]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/manager/login");
    };

    // --- FORM HANDLERS ---
    const handleNestedChange = (parent: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev as any)[parent], [field]: value }
        }));
    };

    const handleRoleChange = (index: number, field: string, value: any) => {
        const newRoles = [...formData.roles];
        (newRoles[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, roles: newRoles }));
    };

    const saveAsDraft = async (): Promise<string | null> => {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const result = await res.json();
            if (res.ok && result.success) {
                return result.data.id; // Giả sử API trả về { data: { id: "..." } }
            } else {
                alert("Lưu bản nháp thất bại: " + result.message);
                return null;
            }
        } catch (err) {
            alert("Lỗi kết nối khi lưu bản nháp");
            return null;
        }
    };

    // --- MAIN ACTION: Lưu và Gửi duyệt luôn ---
    const handleSubmitForApproval = async () => {
        // 1. Kiểm tra xác nhận
        if (!window.confirm("Hệ thống sẽ lưu bản nháp và gửi duyệt ngay lập tức. Bạn chắc chắn chứ?")) return;
        
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        try {
            // 2. Lưu Draft trước để lấy ID
            const newEventId = await saveAsDraft();
            if (!newEventId) {
                setLoading(false);
                return;
            }

            // 3. Gọi API gửi duyệt với ID vừa lấy được
            const res = await fetch(`${API_BASE_URL}/events/${newEventId}/submit`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();

            if (result.success) {
                alert("Sự kiện đã được lưu và gửi duyệt cho Admin thành công!");
                navigate("/manager/my-events");
            } else {
                alert("Lưu nháp thành công nhưng lỗi gửi duyệt: " + (result.message || "Lỗi không xác định"));
            }
        } catch (err) {
            alert("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const result = await res.json();
            if (res.ok && result.success) {
                alert("Event created successfully as DRAFT!");
                navigate("/manager/my-events");
            } else { alert(result.message); }
        } catch (err) { alert("Network error"); } finally { setLoading(false); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden', backgroundColor: COLORS.BACKGROUND }}>
            
            <aside style={styles.sidebar}>
                <div style={{ padding: '30px 24px', borderBottom: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                    <h1 style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: COLORS.DARK_NAVY }}><FaUsers color={COLORS.PRIMARY} /> Manager</h1>
                </div>
                <nav style={{ flex: 1, padding: '20px 12px' }}>
                    <div onClick={() => navigate("/manager/dashboard")} style={{ ...styles.navItem, cursor: 'pointer' }}>
                        <FaClipboardList style={{ marginRight: '12px' }} /> Pending Applications
                    </div>
                    <div onClick={() => navigate("/manager/my-events")} style={{ ...styles.navItem, backgroundColor: 'rgba(26, 115, 232, 0.15)', color: COLORS.PRIMARY, cursor: 'default' }}>
                        <FaPlus style={{ marginRight: '12px' }} /> My Events
                    </div>
                </nav>
                <div style={{ padding: '20px', borderTop: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <img src={user?.avatar || ''} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: `1px solid ${COLORS.SIDEBAR_BORDER}` }} alt="avatar" />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user?.username}</div>
                            <div style={{ fontSize: '11px', color: COLORS.TEXT_SECONDARY }}>Organizer</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutBtn}><FaSignOutAlt /> Logout</button>
                </div>
            </aside>

            <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '40px', boxSizing: 'border-box' }}>
                <header style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <button onClick={() => navigate(-1)} style={styles.iconBtn}><FaArrowLeft color={COLORS.PRIMARY}/></button>
                         <h1 style={{ margin: 0, fontSize: '28px', color: COLORS.DARK_NAVY }}>Create Event</h1>
                    </div>
                    <p style={{ margin: '8px 0 0 55px', color: COLORS.TEXT_SECONDARY }}>Fill in details to create a draft event for review.</p>
                </header>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Card 1: Thông tin chung */}
                    <div style={styles.card}>
                        <h3 style={{...styles.cardHeader, color: COLORS.PRIMARY}}><FaInfoCircle color={COLORS.PRIMARY}/> General Information</h3>
                        <div style={styles.formGrid}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={styles.label}>Event Title</label>
                                <input required style={styles.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Enter event name..." />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={styles.label}>Description</label>
                                <textarea required style={{ ...styles.input, minHeight: '100px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the activities..." />
                            </div>
                            <div>
                                <label style={styles.label}>Category</label>
                                <select 
                                    required 
                                    style={styles.input} 
                                    value={formData.categoryId} 
                                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={styles.label}>Tags (comma separated)</label>
                                <input style={styles.input} placeholder="môi trường, trồng cây..." onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})} />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Địa điểm & Thời gian */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={styles.card}>
                            <h3 style={{...styles.cardHeader, color: COLORS.PRIMARY}}><FaMapMarkerAlt color={COLORS.PRIMARY} /> Location</h3>
                            <label style={styles.label}>City</label>
                            <input style={{ ...styles.input, marginBottom: '10px' }} value={formData.location.city} onChange={e => handleNestedChange('location', 'city', e.target.value)} />
                            <label style={styles.label}>District</label>
                            <input style={{ ...styles.input, marginBottom: '10px' }} value={formData.location.district} onChange={e => handleNestedChange('location', 'district', e.target.value)} />
                            <label style={styles.label}>Specific Address</label>
                            <input style={styles.input} value={formData.location.address} onChange={e => handleNestedChange('location', 'address', e.target.value)} />
                        </div>

                        <div style={styles.card}>
                            <h3 style={{...styles.cardHeader, color: COLORS.PRIMARY}}><FaCalendarAlt color={COLORS.PRIMARY} /> Schedule</h3>
                            <label style={styles.label}>Start Date</label>
                            <input type="datetime-local" style={{ ...styles.input, marginBottom: '10px' }} onChange={e => handleNestedChange('schedule', 'startDate', new Date(e.target.value).toISOString())} />
                            <label style={styles.label}>End Date</label>
                            <input type="datetime-local" style={{ ...styles.input, marginBottom: '10px' }} onChange={e => handleNestedChange('schedule', 'endDate', new Date(e.target.value).toISOString())} />
                            <label style={styles.label}>Registration Deadline</label>
                            <input type="datetime-local" style={styles.input} onChange={e => handleNestedChange('schedule', 'registrationDeadline', new Date(e.target.value).toISOString())} />
                        </div>
                    </div>

                    {/* Card 3: Yêu cầu & Năng lực */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={styles.card}>
                            <h3 style={{...styles.cardHeader, color: COLORS.PRIMARY}}><FaClipboardCheck /> Requirements</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                <div><label style={styles.label}>Min Age</label><input type="number" style={styles.input} value={formData.requirements.minAge} onChange={e => handleNestedChange('requirements', 'minAge', parseInt(e.target.value))} /></div>
                                <div><label style={styles.label}>Max Age</label><input type="number" style={styles.input} value={formData.requirements.maxAge} onChange={e => handleNestedChange('requirements', 'maxAge', parseInt(e.target.value))} /></div>
                            </div>
                            <label style={styles.label}>Health Requirements</label>
                            <input style={styles.input} value={formData.requirements.healthRequirements} onChange={e => handleNestedChange('requirements', 'healthRequirements', e.target.value)} placeholder="e.g. Sức khỏe tốt" />
                        </div>
                        <div style={styles.card}>
                            <h3 style={{...styles.cardHeader, color: COLORS.PRIMARY}}><FaUserFriends /> Volunteer Capacity</h3>
                            <label style={styles.label}>Min Volunteers</label>
                            <input type="number" style={{...styles.input, marginBottom: '10px'}} value={formData.capacity.minVolunteers} onChange={e => handleNestedChange('capacity', 'minVolunteers', parseInt(e.target.value))} />
                            <label style={styles.label}>Max Volunteers</label>
                            <input type="number" style={styles.input} value={formData.capacity.maxVolunteers} onChange={e => handleNestedChange('capacity', 'maxVolunteers', parseInt(e.target.value))} />
                        </div>
                    </div>

                    {/* Card 4: Vai trò (Có Description) */}
                    <div style={styles.card}>
                        <h3 style={{...styles.cardHeader, color: COLORS.PRIMARY}}><FaUsers /> Roles Assignment</h3>
                        {formData.roles.map((role, idx) => (
                            <div key={idx} style={{ padding: '15px', border: `1px solid ${COLORS.BORDER}`, borderRadius: '8px', marginBottom: '15px', backgroundColor: '#F8F9FA' }}>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                                    <div style={{ flex: 2 }}>
                                        <label style={styles.label}>Role Name</label>
                                        <input required style={styles.input} value={role.name} onChange={e => handleRoleChange(idx, 'name', e.target.value)} placeholder="Nhóm trồng cây..." />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={styles.label}>Slots</label>
                                        <input type="number" style={styles.input} value={role.slots} onChange={e => handleRoleChange(idx, 'slots', parseInt(e.target.value))} />
                                    </div>
                                    <button type="button" onClick={() => setFormData({...formData, roles: formData.roles.filter((_, i) => i !== idx)})} style={{...styles.deleteBtn, marginTop: '25px'}}><FaTrash /></button>
                                </div>
                                <label style={styles.label}>Role Description</label>
                                <textarea required style={{ ...styles.input, minHeight: '60px' }} value={role.description} onChange={e => handleRoleChange(idx, 'description', e.target.value)} placeholder="Mô tả công việc của vai trò này..." />
                            </div>
                        ))}
                        <button type="button" onClick={() => setFormData({...formData, roles: [...formData.roles, {name: "", description: "", slots: 1}]})} style={styles.addBtn}>+ Add Another Role</button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '40px' }}>
                        <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>Discard</button>
                        <button type="submit" disabled={loading} style={styles.submitBtn}>{loading ? "Saving..." : "Save draft"}</button>
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
    sidebar: { width: '280px', minWidth: '280px', backgroundColor: COLORS.SIDEBAR_BG, color: COLORS.SIDEBAR_TEXT, display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', borderRight: `1px solid ${COLORS.SIDEBAR_BORDER}`, zIndex: 100 } as React.CSSProperties,
    navItem: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', marginBottom: '4px' } as React.CSSProperties,
    logoutBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#FCE8E6', color: COLORS.DANGER, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' } as React.CSSProperties,
    card: { backgroundColor: COLORS.CARD_BG, padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', border: `1px solid ${COLORS.BORDER}` } as React.CSSProperties,
    cardHeader: { margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: COLORS.DARK_NAVY, borderBottom: `1px solid ${COLORS.BORDER}`, paddingBottom: '15px' } as React.CSSProperties,
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' } as React.CSSProperties,
    label: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: COLORS.TEXT_SECONDARY },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.BORDER}`, fontSize: '14px', boxSizing: 'border-box', outlineColor: COLORS.PRIMARY, backgroundColor: '#F8F9FA', color: COLORS.TEXT_MAIN } as React.CSSProperties,
    iconBtn: { padding: 0, width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: COLORS.WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } as React.CSSProperties,
    addBtn: { background: 'none', border: `1px dashed ${COLORS.PRIMARY}`, color: COLORS.PRIMARY, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', marginTop: '10px' } as React.CSSProperties,
    deleteBtn: { padding: '12px', backgroundColor: '#FCE8E6', color: COLORS.DANGER, border: 'none', borderRadius: '8px', cursor: 'pointer', height: '45px', display: 'flex', alignItems: 'center' } as React.CSSProperties,
    submitBtn: { padding: '12px 30px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' } as React.CSSProperties,
    cancelBtn: { padding: '12px 30px', backgroundColor: '#E8EAED', color: COLORS.TEXT_MAIN, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' } as React.CSSProperties,
    submitApprovalBtn: { padding: '14px 25px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)' } as React.CSSProperties,
};

export default CreateEvent;