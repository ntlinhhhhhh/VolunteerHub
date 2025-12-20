import React, { useEffect, useState, useCallback } from "react";
import {
    FaPlus, FaTrash, FaArrowLeft, FaUsers, FaSignOutAlt, FaCalendarAlt, 
    FaMapMarkerAlt, FaClipboardList, FaInfoCircle, FaCheckCircle, FaTag
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

    // Form State mapping chính xác với API Body bạn cung cấp
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "694182c70c43de3da5dda567",
        location: { address: "", city: "", district: "" },
        schedule: { startDate: "", endDate: "", registrationDeadline: "" },
        requirements: {
            minAge: 16,
            maxAge: 55,
            skills: [] as string[],
            experience: "Không yêu cầu",
            healthRequirements: ""
        },
        capacity: { maxVolunteers: 50, minVolunteers: 10 },
        roles: [{ name: "", description: "", slots: 10 }],
        visibility: "public",
        tags: [] as string[]
    });

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

    useEffect(() => { fetchUserProfile(); }, [fetchUserProfile]);

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
                navigate("/manager/dashboard");
            } else { alert(result.message); }
        } catch (err) { alert("Network error"); } finally { setLoading(false); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden', backgroundColor: COLORS.BACKGROUND }}>
            
            {/* SIDEBAR (Copy hoàn toàn từ Dashboard) */}
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

            {/* MAIN CONTENT */}
            <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '40px', boxSizing: 'border-box' }}>
                <header style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <button onClick={() => navigate(-1)} style={styles.iconBtn}><FaArrowLeft /></button>
                         <h1 style={{ margin: 0, fontSize: '28px', color: COLORS.DARK_NAVY }}>Create Event</h1>
                    </div>
                    <p style={{ margin: '8px 0 0 55px', color: COLORS.TEXT_SECONDARY }}>Fill in details to create a draft event for review.</p>
                </header>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Card 1: Thông tin chung */}
                    <div style={styles.card}>
                        <h3 style={styles.cardHeader}><FaInfoCircle color={COLORS.PRIMARY} /> General Information</h3>
                        <div style={styles.formGrid}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={styles.label}>Event Title</label>
                                <input required style={styles.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Enter event name..." />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={styles.label}>Description</label>
                                <textarea required style={{ ...styles.input, minHeight: '100px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the activities..." />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Địa điểm & Thời gian */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={styles.card}>
                            <h3 style={styles.cardHeader}><FaMapMarkerAlt color={COLORS.PRIMARY} /> Location</h3>
                            <label style={styles.label}>City</label>
                            <input style={{ ...styles.input, marginBottom: '10px' }} value={formData.location.city} onChange={e => handleNestedChange('location', 'city', e.target.value)} />
                            <label style={styles.label}>District</label>
                            <input style={{ ...styles.input, marginBottom: '10px' }} value={formData.location.district} onChange={e => handleNestedChange('location', 'district', e.target.value)} />
                            <label style={styles.label}>Specific Address</label>
                            <input style={styles.input} value={formData.location.address} onChange={e => handleNestedChange('location', 'address', e.target.value)} />
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardHeader}><FaCalendarAlt color={COLORS.PRIMARY} /> Schedule</h3>
                            <label style={styles.label}>Start Date</label>
                            <input type="datetime-local" style={{ ...styles.input, marginBottom: '10px' }} onChange={e => handleNestedChange('schedule', 'startDate', new Date(e.target.value).toISOString())} />
                            <label style={styles.label}>End Date</label>
                            <input type="datetime-local" style={{ ...styles.input, marginBottom: '10px' }} onChange={e => handleNestedChange('schedule', 'endDate', new Date(e.target.value).toISOString())} />
                            <label style={styles.label}>Registration Deadline</label>
                            <input type="datetime-local" style={styles.input} onChange={e => handleNestedChange('schedule', 'registrationDeadline', new Date(e.target.value).toISOString())} />
                        </div>
                    </div>

                    {/* Card 3: Vai trò & Số lượng */}
                    <div style={styles.card}>
                        <h3 style={styles.cardHeader}><FaUsers color={COLORS.PRIMARY} /> Roles & Capacity</h3>
                        {formData.roles.map((role, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={styles.label}>Role Name</label>
                                    <input style={styles.input} value={role.name} onChange={e => handleRoleChange(idx, 'name', e.target.value)} placeholder="e.g. Coordinator" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={styles.label}>Slots</label>
                                    <input type="number" style={styles.input} value={role.slots} onChange={e => handleRoleChange(idx, 'slots', parseInt(e.target.value))} />
                                </div>
                                <button type="button" onClick={() => setFormData({...formData, roles: formData.roles.filter((_, i) => i !== idx)})} style={styles.deleteBtn}><FaTrash /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setFormData({...formData, roles: [...formData.roles, {name: "", description: "", slots: 1}]})} style={styles.addBtn}>+ Add Another Role</button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '40px' }}>
                        <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>Discard</button>
                        <button type="submit" disabled={loading} style={styles.submitBtn}>{loading ? "Saving..." : "Create Draft Event"}</button>
                    </div>
                </form>
            </main>
        </div>
    );
};

// --- STYLES OBJECT ---
const styles = {
    sidebar: { width: '280px', minWidth: '280px', backgroundColor: COLORS.SIDEBAR_BG, color: COLORS.SIDEBAR_TEXT, display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', borderRight: `1px solid ${COLORS.SIDEBAR_BORDER}`, zIndex: 100 } as React.CSSProperties,
    navItem: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', marginBottom: '4px' } as React.CSSProperties,
    logoutBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#FCE8E6', color: COLORS.DANGER, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' } as React.CSSProperties,
    card: { backgroundColor: COLORS.CARD_BG, padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', border: `1px solid ${COLORS.BORDER}` } as React.CSSProperties,
    cardHeader: { margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: COLORS.DARK_NAVY, borderBottom: `1px solid ${COLORS.BORDER}`, paddingBottom: '15px' } as React.CSSProperties,
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' } as React.CSSProperties,
    label: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: COLORS.TEXT_SECONDARY },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.BORDER}`, fontSize: '14px', boxSizing: 'border-box', outlineColor: COLORS.PRIMARY, backgroundColor: COLORS.BACKGROUND, color: COLORS.TEXT_MAIN } as React.CSSProperties,
    iconBtn: { padding: 0, width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: COLORS.WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } as React.CSSProperties,
    addBtn: { background: 'none', border: `1px dashed ${COLORS.PRIMARY}`, color: COLORS.PRIMARY, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', marginTop: '10px' } as React.CSSProperties,
    deleteBtn: { padding: '12px', backgroundColor: '#FCE8E6', color: COLORS.DANGER, border: 'none', borderRadius: '8px', cursor: 'pointer' } as React.CSSProperties,
    submitBtn: { padding: '12px 30px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' } as React.CSSProperties,
    cancelBtn: { padding: '12px 30px', backgroundColor: '#E8EAED', color: COLORS.TEXT_MAIN, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' } as React.CSSProperties,
};

export default CreateEvent;