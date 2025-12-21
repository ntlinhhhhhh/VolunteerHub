// import { Heart, MessageSquare, Send, Image as ImageIcon, X, MoreVertical, Pin, Edit2, Trash2, Users } from "lucide-react";
// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// const API_BASE_URL = "http://localhost:8000";

// const COLORS = {
//     PRIMARY: '#1976D2',
//     PRIMARY_DARK: '#1565C0',
//     PRIMARY_LIGHT: '#E7F3FF', // Xanh nhạt kiểu Facebook
//     DARK: '#0F172A',
//     BACKGROUND: '#F0F2F5', // Màu nền chuẩn Facebook
//     CARD_BG: '#FFFFFF',
//     BORDER: '#E4E6EB',
//     TEXT_MAIN: '#050505',
//     TEXT_SECONDARY: '#65676B',
//     TEXT_LIGHT: '#B0B3B8',
//     DANGER: '#F02849',
//     DANGER_LIGHT: '#FEE2E2',
//     SUCCESS: '#45BD62',
//     WHITE: '#FFFFFF',
//     HOVER: '#F2F2F2',
//     SHADOW: 'rgba(0, 0, 0, 0.1)',
// };

// interface Post {
//     id: string;
//     eventId: string;
//     authorId: string;
//     authorName: string;
//     authorAvatar?: string;
//     content: string;
//     images: string[];
//     isPinned: boolean;
//     likesCount: number;
//     commentsCount: number;
//     likedBy: string[];
//     comments: Comment[];
//     createdAt: string;
// }

// interface Comment {
//     id: string;
//     authorId: string;
//     authorName: string;
//     authorAvatar?: string;
//     content: string;
//     createdAt: string;
// }

// interface UserData {
//     _id?: string;
//     id?: string;
//     fullName: string;
//     email: string;
//     avatar: string;
//     role: string;
// }

// const ManagerCommunication: React.FC = () => {
//     const navigate = useNavigate();
//     const { eventId } = useParams<{ eventId: string }>();
//     const [user, setUser] = useState<UserData>();
//     const [posts, setPosts] = useState<Post[]>([]);
//     const [loading, setLoading] = useState(false);

//     const [showModal, setShowModal] = useState(false);
//     const [isEditing, setIsEditing] = useState(false);
//     const [currentPostId, setCurrentPostId] = useState<string | null>(null);
//     const [content, setContent] = useState("");
//     const [selectedImages, setSelectedImages] = useState<File[]>([]);
//     const [previewUrls, setPreviewUrls] = useState<string[]>([]);
//     const [activeMenu, setActiveMenu] = useState<string | null>(null);
//     const [selectedImage, setSelectedImage] = useState<string | null>(null);
//     const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
//     const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());


//     // ==================== LOGIC API (GIỮ NGUYÊN) ====================
//     const fetchUserProfile = useCallback(async () => {
//         const token = localStorage.getItem("accessToken");
//         if (!token) { navigate("/manager/login"); return; }
//         try {
//             const res = await fetch(`${API_BASE_URL}/users/me`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             const result = await res.json();
//             if (result.success) {
//                 const userData = result.data;
//                 if (userData.avatar && !userData.avatar.startsWith('http')) {
//                     userData.avatar = `${API_BASE_URL}/${userData.avatar.replace(/^\//, '')}`;
//                 }
//                 setUser(userData);
//             }
//         } catch (err) { console.error(err); }
//     }, [navigate]);

//     const fetchPosts = useCallback(async () => {
//         setLoading(true);
//         try {
//             const res = await fetch(`${API_BASE_URL}/events/${eventId}/posts?sortBy=latest`);
//             const result = await res.json();
//             if (result.data) {
//                 const processPost = (p: any) => ({
//                     ...p,
//                     id: p._id || p.id,
//                     images: (p.images || []).map((img: string) =>
//                         img.startsWith('http') ? img : `${API_BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`
//                     ),
//                     authorAvatar: p.authorAvatar ? (p.authorAvatar.startsWith('http') ? p.authorAvatar : `${API_BASE_URL}/${p.authorAvatar.replace(/^\//, '')}`) : null
//                 });
//                 const pinned = (result.data.pinnedPosts || []).map(processPost);
//                 const normal = (result.data.posts || []).map(processPost);
//                 setPosts([...pinned, ...normal]);
//             }
//         } catch (err) { console.error(err); } finally { setLoading(false); }
//     }, [eventId]);

//     useEffect(() => {
//         fetchUserProfile();
//         fetchPosts();
//     }, [fetchUserProfile, fetchPosts]);

//     const handleLikePost = async (postId: string) => {
//         const post = posts.find(p => p.id === postId);
//         if (!post) return;
//         const currentUserId = user?.id || user?._id || '';
//         const isLiked = post.likedBy.includes(currentUserId);
//         try {
//             const response = await fetch(`${API_BASE_URL}/events/${eventId}/posts/${postId}/like`, {
//                 method: isLiked ? 'DELETE' : 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
//             if (response.ok) {
//                 setPosts(prev => prev.map(p => p.id === postId ? {
//                     ...p,
//                     likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
//                     likedBy: isLiked ? p.likedBy.filter(id => id !== currentUserId) : [...p.likedBy, currentUserId]
//                 } : p));
//             }
//         } catch (e) { console.error(e); }
//     };

//     const handleAddComment = async (postId: string) => {
//         const content = commentInputs[postId]?.trim();
//         if (!content) return;
//         try {
//             const response = await fetch(`${API_BASE_URL}/events/${eventId}/posts/${postId}/comments`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     authorId: user?.id || user?._id,
//                     authorName: user?.fullName,
//                     authorAvatar: user?.avatar?.replace(API_BASE_URL, ''),
//                     content
//                 })
//             });
//             if (response.ok) {
//                 setCommentInputs(prev => ({ ...prev, [postId]: '' }));
//                 fetchPosts();
//             }
//         } catch (e) { console.error(e); }
//     };

//     const handleCreateOrUpdate = async () => {
//         const token = localStorage.getItem("accessToken");
//         if (!content.trim()) { alert("Vui lòng nhập nội dung!"); return; }
//         try {
//             if (isEditing && currentPostId) {
//                 await fetch(`${API_BASE_URL}/events/${eventId}/posts/${currentPostId}`, {
//                     method: "PUT",
//                     headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//                     body: JSON.stringify({ content, images: [] })
//                 });
//             } else {
//                 const formData = new FormData();
//                 formData.append("content", content);
//                 selectedImages.forEach(img => formData.append("images", img));
//                 await fetch(`${API_BASE_URL}/events/${eventId}/posts`, {
//                     method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData
//                 });
//             }
//             closeModal(); fetchPosts();
//         } catch (err) { console.error(err); }
//     };

//     const handleDelete = async (postId: string) => {
//         if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
//         const token = localStorage.getItem("accessToken");
//         try {
//             await fetch(`${API_BASE_URL}/events/${postId}`, {
//                 method: "DELETE", headers: { Authorization: `Bearer ${token}` }
//             });
//             fetchPosts();
//         } catch (err) { console.error(err); }
//     };

//     const handlePin = async (post: Post) => {
//         const token = localStorage.getItem("accessToken");
//         const action = post.isPinned ? "unpin" : "pin";
//         try {
//             await fetch(`${API_BASE_URL}/events/${eventId}/posts/${post.id}/${action}`, {
//                 method: "PATCH", headers: { Authorization: `Bearer ${token}` }
//             });
//             fetchPosts(); setActiveMenu(null);
//         } catch (err) { console.error(err); }
//     };

//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files) {
//             const filesArray = Array.from(e.target.files);
//             setSelectedImages(prev => [...prev, ...filesArray]);
//             const urls = filesArray.map(file => URL.createObjectURL(file));
//             setPreviewUrls(prev => [...prev, ...urls]);
//         }
//     };

//     const removePreviewImage = (index: number) => {
//         setSelectedImages(prev => prev.filter((_, i) => i !== index));
//         setPreviewUrls(prev => prev.filter((_, i) => i !== index));
//     };

//     const formatTime = (dateString: string) => {
//         const diff = new Date().getTime() - new Date(dateString).getTime();
//         const mins = Math.floor(diff / 60000);
//         const hrs = Math.floor(mins / 60);
//         const days = Math.floor(hrs / 24);
//         if (mins < 1) return 'Vừa xong';
//         if (mins < 60) return `${mins} phút`;
//         if (hrs < 24) return `${hrs} giờ`;
//         return days < 7 ? `${days} ngày` : new Date(dateString).toLocaleDateString('vi-VN');
//     };

//     const toggleComments = (postId: string) => {
//         setExpandedComments(prev => {
//             const newSet = new Set(prev);
//             newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
//             return newSet;
//         });
//     };

//     const closeModal = () => {
//         setShowModal(false); setIsEditing(false); setContent("");
//         setSelectedImages([]); setPreviewUrls([]); setCurrentPostId(null); setActiveMenu(null);
//     };

//     // ==================== RENDERING ====================
//     const renderAvatar = (url?: string, name?: string, size: number = 40) => (
//         <div style={{
//             width: `${size}px`, height: `${size}px`, borderRadius: '50%',
//             backgroundColor: '#DBEAFE', color: COLORS.PRIMARY,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontWeight: '600', fontSize: `${size / 2.5}px`, overflow: 'hidden',
//             flexShrink: 0, border: `1px solid ${COLORS.BORDER}`
//         }}>
//             {url ? (
//                 <img src={url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
//             ) : (
//                 name?.charAt(0).toUpperCase() || 'U'
//             )}
//         </div>
//     );

//     return (
//         <div style={styles.container}>
//             {/* Sidebar (Dựa trên ảnh mẫu) */}
//             <aside style={styles.sidebar}>
//                 <div style={styles.sidebarHeader}>
//                     <div style={styles.logo}>
//                         <div style={styles.logoCircle}>
//                             <Users size={20} color={COLORS.PRIMARY} />
//                         </div>
//                         <span style={styles.logoText}>Manager</span>
//                     </div>
//                 </div>
//                 <nav style={styles.nav}>
//                     <div onClick={() => navigate("/manager/statistics")} style={styles.navItem}>
//                          <div style={{width: 24, display: 'flex', justifyContent: 'center'}}><ImageIcon size={18} /></div>
//                          <span>Statistics</span>
//                     </div>
//                     <div onClick={() => navigate("/manager/pending-applications")} style={styles.navItem}>
//                          <div style={{width: 24, display: 'flex', justifyContent: 'center'}}><MessageSquare size={18} /></div>
//                          <span>Pending Applications</span>
//                     </div>
//                     <div onClick={() => navigate("/manager/my-events")} style={styles.navItemActive}>
//                          <div style={{width: 24, display: 'flex', justifyContent: 'center'}}><ImageIcon size={18} /></div>
//                          <span>My Events</span>
//                     </div>
//                 </nav>
//                 <div style={styles.sidebarFooter}>
//                     <div style={styles.userProfile}>
//                         {renderAvatar(user?.avatar, user?.fullName, 36)}
//                         <div style={{ marginLeft: '12px', overflow: 'hidden' }}>
//                             <div style={styles.userName}>{user?.fullName || 'User'}</div>
//                             <div style={styles.userRole}>Organizer</div>
//                         </div>
//                     </div>
//                     <button onClick={() => {
//                         localStorage.removeItem('accessToken');
//                         navigate("/manager/login");
//                     }} style={styles.logoutBtn}>
//                         <Send size={16} style={{transform: 'rotate(180deg)'}} /> 
//                         Logout
//                     </button>
//                 </div>
//             </aside>

//             {/* Main Area - Căn giữa nội dung */}
//             <main style={styles.main}>
//                 <div style={styles.contentWrapper}>
//                     <div style={styles.banner}>
//                         <div style={styles.bannerOverlay}>
//                             <h1 style={styles.bannerTitle}>Cộng đồng sự kiện</h1>
//                             <p style={styles.bannerSubtitle}>Chia sẻ và cập nhật thông tin mới nhất từ ban tổ chức.</p>
//                         </div>
//                     </div>

//                     <div style={styles.createPostCard}>
//                         {renderAvatar(user?.avatar, user?.fullName, 40)}
//                         <div style={styles.createPostInput} onClick={() => setShowModal(true)}>
//                             Bạn đang nghĩ gì, {user?.fullName?.split(' ').pop()}?
//                         </div>
//                     </div>

//                     <div style={styles.postsContainer}>
//                         {loading ? (
//                              <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>
//                         ) : posts.map(post => (
//                             <article key={post.id} style={styles.postCard}>
//                                 <div style={styles.postHeader}>
//                                     <div style={styles.postAuthor}>
//                                         {renderAvatar(post.authorAvatar, post.authorName, 40)}
//                                         <div style={{ marginLeft: '10px' }}>
//                                             <div style={styles.authorName}>
//                                                 {post.authorName}
//                                                 {post.isPinned && <span style={styles.pinnedBadge}><Pin size={10} fill="currentColor" /></span>}
//                                             </div>
//                                             <div style={styles.postTime}>{formatTime(post.createdAt)}</div>
//                                         </div>
//                                     </div>
//                                     <div style={styles.postMenuContainer}>
//                                         <button style={styles.menuButton} onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}>
//                                             <MoreVertical size={18} />
//                                         </button>
//                                         {activeMenu === post.id && (
//                                             <div style={styles.dropdownMenu}>
//                                                 <div style={styles.dropdownItem} onClick={() => handlePin(post)}>
//                                                     <Pin size={16} /> {post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}
//                                                 </div>
//                                                 <div style={styles.dropdownItem} onClick={() => { setIsEditing(true); setCurrentPostId(post.id); setContent(post.content); setShowModal(true); }}>
//                                                     <Edit2 size={16} /> Chỉnh sửa
//                                                 </div>
//                                                 <div style={{ ...styles.dropdownItem, color: COLORS.DANGER }} onClick={() => handleDelete(post.id)}>
//                                                     <Trash2 size={16} /> Xóa bài viết
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div style={styles.postContent}>
//                                     <p style={styles.postText}>{post.content}</p>

//                                     {post.images && post.images.length > 0 && (
//                                         <div style={{
//                                             ...styles.postImagesGrid,
//                                             gridTemplateColumns: post.images.length === 1 ? '1fr' : '1fr 1fr',
//                                         }}>
//                                             {post.images.slice(0, 4).map((img, i) => (
//                                                 <div key={i} className="post-image-wrapper" style={styles.postImageWrapper} onClick={() => setSelectedImage(img)}>
//                                                     <img src={img} style={styles.postImage} alt="post" />
//                                                     {post.images.length > 4 && i === 3 && (
//                                                         <div style={styles.imageOverlay}>
//                                                             <span style={styles.imageOverlayText}>+{post.images.length - 3}</span>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div style={styles.postStats}>
//                                     <div style={styles.statItem}>
//                                         <Heart size={14} fill={post.likesCount > 0 ? COLORS.DANGER : "none"} color={post.likesCount > 0 ? COLORS.DANGER : COLORS.TEXT_SECONDARY} />
//                                         <span>{post.likesCount || 0}</span>
//                                     </div>
//                                     <span>{post.commentsCount || 0} bình luận</span>
//                                 </div>

//                                 <div style={styles.postActions}>
//                                     <button
//                                         style={{ ...styles.actionBtn, color: post.likedBy.includes(user?.id || user?._id || '') ? COLORS.DANGER : COLORS.TEXT_SECONDARY }}
//                                         onClick={() => handleLikePost(post.id)}
//                                     >
//                                         <Heart size={18} fill={post.likedBy.includes(user?.id || user?._id || '') ? COLORS.DANGER : 'none'} />
//                                         <span>Thích</span>
//                                     </button>
//                                     <button style={styles.actionBtn} onClick={() => toggleComments(post.id)}>
//                                         <MessageSquare size={18} />
//                                         <span>Bình luận</span>
//                                     </button>
//                                 </div>

//                                 {/* Comments Section */}
//                                 {expandedComments.has(post.id) && (
//                                     <div style={styles.commentsSection}>
//                                         {post.comments.map(c => (
//                                             <div key={c.id} style={styles.commentItem}>
//                                                 {renderAvatar(c.authorAvatar ? API_BASE_URL + c.authorAvatar : undefined, c.authorName, 32)}
//                                                 <div style={styles.commentBody}>
//                                                     <div style={styles.commentBubble}>
//                                                         <div style={styles.commentAuthor}>{c.authorName}</div>
//                                                         <div style={styles.commentText}>{c.content}</div>
//                                                     </div>
//                                                     <div style={styles.commentTime}>{formatTime(c.createdAt)}</div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                         <div style={styles.commentInputRow}>
//                                             {renderAvatar(user?.avatar, user?.fullName, 32)}
//                                             <div style={styles.commentInputWrapper}>
//                                                 <input
//                                                     style={styles.commentInput}
//                                                     placeholder="Viết bình luận..."
//                                                     value={commentInputs[post.id] || ''}
//                                                     onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
//                                                     onKeyPress={e => e.key === 'Enter' && handleAddComment(post.id)}
//                                                 />
//                                                 <button style={styles.sendCommentBtn} onClick={() => handleAddComment(post.id)}>
//                                                     <Send size={14} />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </article>
//                         ))}
//                     </div>
//                 </div>
//             </main>

//             {/* Modal - Xem ảnh & Form (Style Refined) */}
//             {showModal && (
//                 <div style={styles.modalOverlay} onClick={closeModal}>
//                     <div style={styles.modal} onClick={e => e.stopPropagation()}>
//                         <div style={styles.modalHeader}>
//                             <h2 style={styles.modalTitle}>{isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
//                             <button style={styles.closeModalBtn} onClick={closeModal}><X size={20}/></button>
//                         </div>
//                         <div style={styles.modalBody}>
//                              <textarea style={styles.textarea} value={content} onChange={e => setContent(e.target.value)} placeholder="Bạn đang nghĩ gì thế?" />
//                              {!isEditing && (
//                                 <div style={styles.imageUploadSection}>
//                                     <div style={styles.previewGrid}>
//                                         {previewUrls.map((url, i) => (
//                                             <div key={i} style={styles.previewItem}>
//                                                 <img src={url} style={styles.previewImage} alt="preview" />
//                                                 <button style={styles.removeImageBtn} onClick={() => removePreviewImage(i)}><X size={10}/></button>
//                                             </div>
//                                         ))}
//                                         <label style={styles.addImgSquare}>
//                                             <ImageIcon size={24} />
//                                             <input type="file" multiple hidden onChange={handleImageChange} accept="image/*" />
//                                         </label>
//                                     </div>
//                                 </div>
//                              )}
//                         </div>
//                         <div style={styles.modalFooter}>
//                             <button onClick={handleCreateOrUpdate} style={styles.submitButton}>
//                                 {isEditing ? 'Lưu thay đổi' : 'Đăng bài'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Image Viewer */}
//             {selectedImage && (
//                 <div style={styles.imageViewerOverlay} onClick={() => setSelectedImage(null)}>
//                     <img src={selectedImage} style={styles.fullImage} alt="view" onClick={e => e.stopPropagation()} />
//                     <button style={styles.closeImageBtn} onClick={() => setSelectedImage(null)}><X size={32}/></button>
//                 </div>
//             )}
//         </div>
//     );
// };

// const styles: { [key: string]: React.CSSProperties } = {
//     container: { display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: COLORS.BACKGROUND, color: COLORS.TEXT_MAIN, fontFamily: "'Inter', sans-serif" },

//     // Sidebar
//     sidebar: { width: '280px', backgroundColor: COLORS.CARD_BG, position: 'fixed', height: '100vh', borderRight: `1px solid ${COLORS.BORDER}`, display: 'flex', flexDirection: 'column', zIndex: 100 },
//     sidebarHeader: { padding: '24px', borderBottom: `1px solid ${COLORS.BORDER}`, marginBottom: '8px' },
//     logo: { display: 'flex', alignItems: 'center', gap: '10px' },
//     logoCircle: { width: 36, height: 36, borderRadius: '50%', backgroundColor: COLORS.PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' },
//     logoText: { fontSize: '20px', fontWeight: '800', color: COLORS.DARK, letterSpacing: '-0.5px' },
//     nav: { flex: 1, padding: '10px' },
//     navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: COLORS.TEXT_MAIN, marginBottom: '2px', transition: '0.2s' },
//     navItemActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', backgroundColor: COLORS.PRIMARY_LIGHT, color: COLORS.PRIMARY, marginBottom: '2px' },
//     sidebarFooter: { padding: '16px', borderTop: `1px solid ${COLORS.BORDER}`, backgroundColor: '#F9FAFB' },
//     userProfile: { display: 'flex', alignItems: 'center', marginBottom: '12px' },
//     userName: { fontWeight: '700', fontSize: '14px', color: COLORS.DARK },
//     userRole: { fontSize: '12px', color: COLORS.TEXT_SECONDARY },
//     logoutBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#FEE2E2', color: COLORS.DANGER, cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },

//     // Main & Content
//     main: { marginLeft: '280px', flex: 1, display: 'flex', justifyContent: 'center', minHeight: '100vh', padding: '0 20px' },
//     contentWrapper: { width: '100%', maxWidth: '65%', paddingTop: '20px', paddingBottom: '60px' },
//     banner: { height: '180px', background: 'linear-gradient(135deg, #8e939bff 0%, #585e64ff 70%)', borderRadius: '12px', position: 'relative', marginBottom: '20px', overflow: 'hidden' },
//     bannerOverlay: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 30px', background: 'rgba(0,0,0,0.1)' },
//     bannerTitle: { fontSize: '28px', fontWeight: '800', color: COLORS.WHITE, margin: 0 },
//     bannerSubtitle: { fontSize: '15px', color: 'rgba(255,255,255,0.9)', marginTop: '8px' },

//     // Create Post Entry
//     createPostCard: { backgroundColor: COLORS.CARD_BG, padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${COLORS.BORDER}`, boxShadow: '0 1px 2px rgba(0,0,0,0.1)', marginBottom: '16px' },
//     createPostInput: { flex: 1, padding: '10px 16px', borderRadius: '20px', backgroundColor: '#F0F2F5', color: COLORS.TEXT_SECONDARY, cursor: 'pointer', fontSize: '15px', transition: '0.2s' },
//     createPostButton: { border: 'none', background: 'none', cursor: 'pointer', color: COLORS.SUCCESS, padding: '8px', borderRadius: '50%' },

//     // Posts
//     postsContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
//     postCard: { backgroundColor: COLORS.CARD_BG, borderRadius: '8px', padding: '12px 16px', border: `1px solid ${COLORS.BORDER}`, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
//     postHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
//     postAuthor: { display: 'flex', alignItems: 'center' },
//     authorName: { fontWeight: '700', color: COLORS.DARK, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' },
//     pinnedBadge: { color: COLORS.PRIMARY, display: 'flex' },
//     postTime: { fontSize: '13px', color: COLORS.TEXT_SECONDARY },
//     postMenuContainer: { position: 'relative' },
//     menuButton: { border: 'none', background: 'none', cursor: 'pointer', color: COLORS.TEXT_SECONDARY, borderRadius: '50%', padding: '6px' },
//     dropdownMenu: { position: 'absolute', right: 0, top: '100%', backgroundColor: COLORS.WHITE, border: `1px solid ${COLORS.BORDER}`, borderRadius: '8px', zIndex: 10, minWidth: '180px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden' },
//     dropdownItem: { padding: '10px 16px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' },
//     postContent: { marginBottom: '12px' },
//     postText: { fontSize: '15px', lineHeight: '1.5', color: COLORS.DARK, whiteSpace: 'pre-wrap', margin: '0 0 10px 0' },
//     postImagesGrid: { display: 'grid', gap: '2px', borderRadius: '8px', overflow: 'hidden' },
//     postImageWrapper: { position: 'relative', overflow: 'hidden', backgroundColor: COLORS.BACKGROUND, aspectRatio: '1/1' },
//     postImage: { width: '100%', height: '100%', objectFit: 'cover' as const },
//     imageOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
//     imageOverlayText: { color: COLORS.WHITE, fontSize: '24px', fontWeight: '700' },
//     postStats: { display: 'flex', justifyContent: 'space-between', padding: '10px 4px', borderBottom: `1px solid ${COLORS.BORDER}`, fontSize: '13px', color: COLORS.TEXT_SECONDARY },
//     statItem: { display: 'flex', alignItems: 'center', gap: '6px' },
//     postActions: { display: 'flex', gap: '4px', paddingTop: '4px' },
//     actionBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', flex: 1, justifyContent: 'center', padding: '8px', borderRadius: '4px', transition: '0.2s' },

//     // Comments
//     commentsSection: { marginTop: '12px', paddingTop: '10px' },
//     commentItem: { display: 'flex', gap: '8px', marginBottom: '12px' },
//     commentBody: { flex: 1 },
//     commentBubble: { backgroundColor: '#F0F2F5', borderRadius: '18px', padding: '8px 12px', display: 'inline-block', maxWidth: '100%' },
//     commentAuthor: { fontWeight: '700', fontSize: '13px', marginBottom: '2px' },
//     commentText: { fontSize: '14px', color: COLORS.DARK },
//     commentTime: { fontSize: '11px', color: COLORS.TEXT_SECONDARY, marginTop: '2px', marginLeft: '12px' },
//     commentInputRow: { display: 'flex', gap: '8px', marginTop: '12px' },
//     commentInputWrapper: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center' },
//     commentInput: { flex: 1, padding: '8px 40px 8px 12px', borderRadius: '20px', border: 'none', backgroundColor: '#F0F2F5', outline: 'none', fontSize: '14px' },
//     sendCommentBtn: { position: 'absolute', right: '10px', border: 'none', background: 'none', color: COLORS.PRIMARY, cursor: 'pointer' },

//     // Modal
//     modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
//     modal: { backgroundColor: COLORS.WHITE, width: '100%', maxWidth: '500px', borderRadius: '12px', boxShadow: '0 12px 28px rgba(0,0,0,0.2)', overflow: 'hidden' },
//     modalHeader: { padding: '16px', borderBottom: `1px solid ${COLORS.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
//     modalTitle: { fontSize: '20px', fontWeight: '700', margin: 0, textAlign: 'center', flex: 1 },
//     closeModalBtn: { border: 'none', background: '#E4E6EB', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
//     modalBody: { padding: '16px' },
//     modalAuthor: { display: 'flex', alignItems: 'center', marginBottom: '16px' },
//     modalAuthorName: { fontWeight: '700', fontSize: '15px' },
//     modalAuthorRole: { fontSize: '12px', color: COLORS.TEXT_SECONDARY },
//     textarea: { width: '100%', minHeight: '150px', border: 'none', fontSize: '18px', outline: 'none', resize: 'none' as const },
//     previewGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
//     previewItem: { position: 'relative', aspectRatio: '1/1' },
//     previewImage: { width: '100%', height: '100%', objectFit: 'cover' as const, borderRadius: '8px' },
//     removeImageBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', color: COLORS.WHITE, border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer' },
//     addImgSquare: { aspectRatio: '1/1', border: `2px dashed ${COLORS.BORDER}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: COLORS.TEXT_SECONDARY },
//     modalFooter: { padding: '16px' },
//     submitButton: { width: '100%', padding: '10px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' },

//     // Helpers
//     imageViewerOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
//     fullImage: { maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' as const },
//     closeImageBtn: { position: 'absolute', top: 20, right: 20, color: 'white', background: 'none', border: 'none', cursor: 'pointer' },
//     spinner: { width: '32px', height: '32px', border: `4px solid #f3f3f3`, borderTop: `4px solid ${COLORS.PRIMARY}`, borderRadius: '50%', animation: 'spin 1s linear infinite' },
// };

// // Keyframe setup
// if (typeof document !== 'undefined') {
//     const styleSheet = document.createElement("style");
//     styleSheet.innerText = `
//         @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//         .post-image-wrapper:hover img { transform: scale(1.03); }
//         article:hover { background-color: #fff !important; }
//     `;
//     document.head.appendChild(styleSheet);
// }

// export default ManagerCommunication;


import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard, Search, Users, UserCircle, Bell, Menu, ChevronLeft,
    MessageSquare, Heart, Send, Trash2, Edit2, Pin, MoreVertical,
    Image as ImageIcon, X, Loader2, LogOut, ArrowRight,
    PinOff, Check, AlertCircle, Calendar, MapPin
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// ==================== INTERFACES ====================
interface Post {
    id: string;
    eventId: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    images?: string[];
    isPinned: boolean;
    likesCount: number;
    commentsCount: number;
    likedBy: string[];
    comments: Comment[];
    createdAt: string;
}

interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
}

interface InAppNotification {
    _id: string;
    type: string;
    subject: string;
    content: string;
    readAt: string | null;
    createdAt: string;
    data: {
        eventTitle?: string;
        eventId?: string;
    };
}

interface EventData {
    id: string;
    title: string;
    description: string;
    schedule?: {
        startDate: string;
        endDate: string;
        registrationDeadline: string;
    };
    location?: {
        address: string;
        city: string;
        district: string;
    };
    coverImage?: string;
}

interface UserData {
    _id?: string;
    id?: string;
    fullName: string;
    email: string;
    avatar: string;
    role: string;
}

const EventCommunicationDetail: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const USER_API_URL = 'http://localhost:8000';

    // UI States
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showPostMenu, setShowPostMenu] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Data States
    const [userData, setUserData] = useState<UserData | null>(null);
    const [eventData, setEventData] = useState<EventData | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [inAppNotis, setInAppNotis] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Loading & Logic States
    const [loading, setLoading] = useState(true);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [submittingPost, setSubmittingPost] = useState(false);
    const [eventNotFound, setEventNotFound] = useState(false);
    const [sortBy, setSortBy] = useState<'latest' | 'most_active'>('latest');

    // Post/Comment Form States
    const [postContent, setPostContent] = useState('');
    const [postImages, setPostImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

    // States cho Update
    const [editingPost, setEditingPost] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const notificationRef = useRef<HTMLDivElement>(null);
    const postMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ==================== EFFECTS ====================
    useEffect(() => {
        if (!eventId) {
            navigate('/volunteer/dashboard');
            return;
        }
        fetchUserProfile();
        fetchEventData();
        fetchPosts();
        fetchNotifications();

        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [eventId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (showPostMenu && postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
                setShowPostMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications, showPostMenu]);

    // ==================== API FUNCTIONS ====================
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${USER_API_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                const rawData = result.data || result;
                setUserData({
                    ...rawData,
                    avatar: rawData.avatar ? (rawData.avatar.startsWith('http') ? rawData.avatar : `${USER_API_URL}${rawData.avatar}`)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(rawData.fullName || 'User')}`
                });
            }
        } catch (e) { console.error(e); }
    };

    const fetchEventData = async () => {
        try {
            const response = await fetch(`${USER_API_URL}/events/${eventId}`);
            if (response.ok) {
                const result = await response.json();
                const event = result.data || result;
                setEventData({
                    id: event.id || event._id,
                    title: event.title,
                    description: event.description,
                    schedule: event.schedule,
                    location: event.location,
                    coverImage: event.media?.images?.[0] ? (event.media.images[0].startsWith('http') ? event.media.images[0] : `${USER_API_URL}${event.media.images[0]}`) : ''
                });
            } else if (response.status === 404) setEventNotFound(true);
        } catch (e) { setEventNotFound(true); }
        finally { setLoading(false); }
    };

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts?sortBy=${sortBy}&limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                const rawData = result.data || result;
                const postsArray = Array.isArray(rawData.posts) ? rawData.posts : [];
                const pinnedArray = Array.isArray(rawData.pinnedPosts) ? rawData.pinnedPosts : [];

                const allMapped = [...pinnedArray, ...postsArray].map((p: any) => ({
                    ...p,
                    id: p.id || p._id,
                    authorAvatar: p.authorAvatar ? (p.authorAvatar.startsWith('http') ? p.authorAvatar : `${USER_API_URL}${p.authorAvatar}`)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.authorName)}`,
                    images: p.images?.map((img: string) => img.startsWith('http') ? img : `${USER_API_URL}${img}`) || []
                }));
                setPosts(allMapped);
            }
        } catch (e) { console.error(e); }
    };

    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
            const token = localStorage.getItem('accessToken');
            const userId = userData?._id || userData?.id;
            if (!userId) return;
            const response = await fetch(`${USER_API_URL}/notifications/${userId}?channel=in_app`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                const notis = result.data || result;
                setInAppNotis(notis.slice(0, 5));
                setUnreadCount(notis.filter((n: any) => !n.readAt).length);
            }
        } catch (e) { console.error(e); }
        finally { setLoadingNotifications(false); }
    };

    // ==================== ACTION HANDLERS ====================
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setPostImages(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
    };

    const removePreviewImage = (index: number) => {
        setPostImages(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleCreatePost = async () => {
        if (!postContent.trim()) return;
        setSubmittingPost(true);
        try {
            const formData = new FormData();
            formData.append('content', postContent);
            formData.append('eventId', eventId!);
            postImages.forEach(file => formData.append('images', file));

            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                body: formData
            });

            if (response.ok) {
                setPostContent('');
                setPostImages([]);
                previewImages.forEach(url => URL.revokeObjectURL(url));
                setPreviewImages([]);
                setShowCreatePost(false);
                fetchPosts();
            }
        } catch (e) { alert("Lỗi khi đăng bài"); }
        finally { setSubmittingPost(false); }
    };

    const handleLikePost = async (postId: string) => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        const currentUserId = userData?.id || userData?._id || '';
        const isLiked = post.likedBy.includes(currentUserId);

        try {
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}/like`, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                setPosts(prev => prev.map(p => p.id === postId ? {
                    ...p,
                    likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
                    likedBy: isLiked ? p.likedBy.filter(id => id !== currentUserId) : [...p.likedBy, currentUserId]
                } : p));
            }
        } catch (e) { console.error(e); }
    };

    const handleAddComment = async (postId: string) => {
        const content = commentInputs[postId]?.trim();
        if (!content) return;
        try {
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    authorId: userData?.id || userData?._id,
                    authorName: userData?.fullName,
                    authorAvatar: userData?.avatar?.replace(USER_API_URL, ''),
                    content
                })
            });
            if (response.ok) {
                setCommentInputs(prev => ({ ...prev, [postId]: '' }));
                fetchPosts();
            }
        } catch (e) { console.error(e); }
    };

    // XÓA BÀI VIẾT
    const handleDeletePost = async (postId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
        try {
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (response.ok) {
                setPosts(posts.filter(p => p.id !== postId));
                setShowPostMenu(null);
            }
        } catch (e) { alert('Lỗi khi xóa bài'); }
    };

    // CẬP NHẬT BÀI VIẾT (Update)
    const handleUpdatePost = async (postId: string) => {
        if (!editContent.trim()) return;
        try {
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: editContent })
            });
            if (response.ok) {
                setPosts(posts.map(p => p.id === postId ? { ...p, content: editContent } : p));
                setEditingPost(null);
            }
        } catch (e) { alert('Lỗi khi cập nhật'); }
    };

    const handlePinPost = async (postId: string, isPinnedNow: boolean) => {
        try {
            const action = isPinnedNow ? 'unpin' : 'pin';
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}/${action}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Cập nhật lại state posts để thay đổi icon ghim mà không cần load lại trang
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, isPinned: !isPinnedNow } : p
                ));
                setShowPostMenu(null);
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Không thể thực hiện ghim bài viết.");
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi kết nối khi ghim bài viết.");
        }
    };

    const formatTime = (dateString: string) => {
        const diff = new Date().getTime() - new Date(dateString).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        const days = Math.floor(hrs / 24);
        if (mins < 1) return 'Vừa xong';
        if (mins < 60) return `${mins} phút trước`;
        if (hrs < 24) return `${hrs} giờ trước`;
        return days < 7 ? `${days} ngày trước` : new Date(dateString).toLocaleDateString('vi-VN');
    };

    const toggleComments = (postId: string) => {
        const next = new Set(expandedComments);
        next.has(postId) ? next.delete(postId) : next.add(postId);
        setExpandedComments(next);
    };

    const getImageGridLayout = (imageCount: number) => {
        if (imageCount === 1) return { columns: '1fr', maxHeight: '500px' };
        if (imageCount === 2) return { columns: '1fr 1fr', maxHeight: '350px' };
        if (imageCount === 3) return { columns: '1fr 1fr', maxHeight: '300px' };
        return { columns: '1fr 1fr', maxHeight: '280px' };
    };

    // ==================== RENDER HELPERS ====================
    if (loading) return <div style={styles.loadingFull}><Loader2 className="animate-spin" /></div>;

    return (
        <div style={styles.layout}>
            {/* Sidebar */}
            <aside style={{ ...styles.sidebar, transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)' }}>
                <div style={styles.sidebarHeader}>
                    <h1 style={styles.brandTitle}>VolunteerHub</h1>
                    {isMobile && <button onClick={() => setSidebarOpen(false)} style={styles.closeBtn}><ChevronLeft /></button>}
                </div>
                <nav style={styles.navMenu}>
                    <SidebarLink icon={<LayoutDashboard size={20} />} onClick={() => navigate('/volunteer/dashboard')} label="Overview" />
                    <SidebarLink icon={<Search size={20} />} onClick={() => navigate('/volunteer/events')} label="Browse Events" />
                    <SidebarLink icon={<Users size={20} />} label="Communication" active />
                    <SidebarLink icon={<UserCircle size={20} />} onClick={() => navigate('/me/profile')} label="My Profile" />
                </nav>
                <div style={styles.sidebarFooter}>
                    <div style={styles.userCard} onClick={() => setShowLogoutPopup(!showLogoutPopup)}>
                        <img src={userData?.avatar} style={styles.sidebarAvatar} alt="avatar" />
                        <div style={styles.userInfo}>
                            <p style={styles.userName}>{userData?.fullName}</p>
                            <p style={styles.userEmail}>{userData?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ ...styles.mainContent, marginLeft: isMobile ? 0 : '280px' }}>
                <header style={styles.topHeader}>
                    <div style={styles.headerLeft}>
                        {isMobile && <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}><Menu /></button>}
                        <div>
                            <h2 style={styles.headerTitle}>Thảo luận</h2>
                            <p style={styles.headerSub}>{eventData?.title}</p>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        <div style={{ position: 'relative' }} ref={notificationRef}>
                            <button style={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>
                                <Bell size={20} />
                                {unreadCount > 0 && <span style={styles.notificationBadge}>{unreadCount}</span>}
                            </button>
                            {showNotifications && (
                                <div style={styles.notificationPopup}>
                                    <div style={styles.notificationHeader}>Thông báo gần đây</div>
                                    {inAppNotis.length > 0 ? inAppNotis.map(n => (
                                        <div key={n._id} style={styles.notificationItem}>
                                            <div style={styles.notificationSubject}>{n.subject}</div>
                                            <div style={styles.notificationText}>{n.content}</div>
                                        </div>
                                    )) : (
                                        <div style={styles.emptyNotification}>Không có thông báo mới</div>
                                    )}
                                </div>
                            )}
                        </div>
                        {!isMobile && <img src={userData?.avatar} style={styles.miniAvatar} alt="avatar" />}
                    </div>
                </header>

                <div style={styles.scrollArea}>
                    {/* Event Banner */}
                    <div style={{
                        ...styles.eventBanner,
                        backgroundImage: eventData?.coverImage ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${eventData.coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                        <h3 style={styles.eventBannerTitle}>{eventData?.title}</h3>
                        <p style={styles.eventBannerDesc}>{eventData?.description}</p>
                        {eventData?.location?.city && (
                            <div style={styles.eventMeta}>
                                <MapPin size={16} /> {eventData.location.city}
                            </div>
                        )}
                    </div>

                    <div style={styles.feedContainer}>
                        {/* Create Post */}
                        <div style={styles.createPostCard}>
                            <img src={userData?.avatar} style={styles.createPostAvatar} alt="me" />
                            <button style={styles.createPostInput} onClick={() => setShowCreatePost(true)}>
                                Bạn muốn chia sẻ điều gì về sự kiện?
                            </button>
                        </div>

                        {/* Posts List */}
                        <div style={styles.postsContainer}>
                            {posts.map(post => (
                                <div key={post.id} style={styles.postCard}>
                                    <div style={styles.postHeader}>
                                        <div style={styles.postAuthor}>
                                            <img src={post.authorAvatar} style={styles.postAvatar} alt="avt" />
                                            <div>
                                                <div style={styles.postAuthorName}>
                                                    {post.authorName}
                                                    {post.isPinned && (
                                                        <span style={styles.pinnedBadge}>
                                                            <Pin size={12} fill="#007bff" />
                                                            <span style={{ marginLeft: '4px' }}>Đã ghim</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={styles.postTime}>{formatTime(post.createdAt)}</div>
                                            </div>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                style={styles.postMenuBtn}
                                                onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            {/* DROPDOWN MENU EDIT/DELETE */}
                                            {showPostMenu === post.id && (
                                                <div style={styles.postMenu} ref={postMenuRef}>
                                                    {/* NÚT CHỈNH SỬA */}
                                                    <div
                                                        style={styles.postMenuItem}
                                                        onClick={() => {
                                                            setEditContent(post.content);
                                                            setEditingPost(post.id);
                                                            setShowPostMenu(null);
                                                        }}
                                                    >
                                                        <Edit2 size={16} color="#007bff" />
                                                        <span style={{ fontWeight: 600 }}>Chỉnh sửa bài</span>
                                                    </div>

                                                    {/* NÚT XÓA */}
                                                    <div
                                                        style={{ ...styles.postMenuItem, color: '#EF4444' }}
                                                        onClick={() => {
                                                            if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
                                                                handleDeletePost(post.id);
                                                                setShowPostMenu(null);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 size={16} color="#EF4444" />
                                                        <span style={{ fontWeight: 600 }}>Xóa bài viết</span>
                                                    </div>
                                                    <div
                                                        style={styles.postMenuItem}
                                                        onClick={() => handlePinPost(post.id, post.isPinned)}
                                                    >
                                                        {post.isPinned ? (
                                                            <><PinOff size={16} color="#64748B" /> <span style={{ fontWeight: 600 }}>Bỏ ghim</span></>
                                                        ) : (
                                                            <><Pin size={16} color="#007bff" /> <span style={{ fontWeight: 600 }}>Ghim bài viết</span></>
                                                        )}
                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={styles.postContent}>
                                        {editingPost === post.id ? (
                                            <div style={styles.editContainer}>
                                                <textarea
                                                    style={styles.editTextarea}
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    autoFocus
                                                />
                                                <div style={styles.editActions}>
                                                    <button style={styles.cancelEditBtn} onClick={() => setEditingPost(null)}>Hủy</button>
                                                    <button style={styles.saveEditBtn} onClick={() => handleUpdatePost(post.id)}>Lưu thay đổi</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p style={styles.postText}>{post.content}</p>
                                                {post.images && post.images.length > 0 && (
                                                    <div style={{
                                                        ...styles.postImagesGrid,
                                                        gridTemplateColumns: getImageGridLayout(post.images.length).columns
                                                    }}>
                                                        {post.images.slice(0, 4).map((img, i) => {
                                                            const isFirstOfThree = post.images?.length === 3 && i === 0;
                                                            const isOverflow = post.images && post.images.length > 4 && i === 3;
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    style={{
                                                                        ...styles.postImageWrapper,
                                                                        gridColumn: isFirstOfThree ? 'span 2' : 'auto',
                                                                        maxHeight: getImageGridLayout(post.images?.length || 0).maxHeight,
                                                                        position: 'relative', cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => setSelectedImage(img)}
                                                                >
                                                                    <img src={img} style={styles.postImage} alt="post" />
                                                                    {isOverflow && (
                                                                        <div style={styles.imageOverlay}>
                                                                            <span style={styles.imageOverlayText}>+{post.images!.length - 4}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div style={styles.postStats}>
                                        <span style={styles.statText}>{post.likesCount > 0 && `${post.likesCount} lượt thích`}</span>
                                        <span style={styles.statText}>{post.commentsCount > 0 && `${post.commentsCount} bình luận`}</span>
                                    </div>

                                    <div style={styles.postActions}>
                                        <button
                                            style={{
                                                ...styles.actionBtn,
                                                color: post.likedBy.includes(userData?.id || userData?._id || '') ? '#EF4444' : '#64748B'
                                            }}
                                            onClick={() => handleLikePost(post.id)}
                                        >
                                            <Heart size={20} fill={post.likedBy.includes(userData?.id || userData?._id || '') ? '#EF4444' : 'none'} />
                                            <span>Thích</span>
                                        </button>
                                        <button style={styles.actionBtn} onClick={() => toggleComments(post.id)}>
                                            <MessageSquare size={20} />
                                            <span>Bình luận</span>
                                        </button>
                                    </div>

                                    {expandedComments.has(post.id) && (
                                        <div style={styles.commentsSection}>
                                            <div style={styles.commentInputSection}>
                                                <img src={userData?.avatar} style={styles.commentInputAvatar} alt="me" />
                                                <div style={styles.commentInputWrapper}>
                                                    <input
                                                        style={styles.commentInput}
                                                        placeholder="Viết bình luận..."
                                                        value={commentInputs[post.id] || ''}
                                                        onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                                        onKeyPress={e => e.key === 'Enter' && handleAddComment(post.id)}
                                                    />
                                                    <button
                                                        style={styles.sendCommentBtn}
                                                        onClick={() => handleAddComment(post.id)}
                                                        disabled={!commentInputs[post.id]?.trim()}
                                                    >
                                                        <Send size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            {post.comments.map(c => (
                                                <div key={c.id} style={styles.commentItem}>
                                                    <img
                                                        src={c.authorAvatar ? (c.authorAvatar.startsWith('http') ? c.authorAvatar : `${USER_API_URL}${c.authorAvatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName)}`}
                                                        style={styles.commentAvatar}
                                                        alt="avt"
                                                    />
                                                    <div style={styles.commentBody}>
                                                        <div style={styles.commentBubble}>
                                                            <div style={styles.commentAuthor}>{c.authorName}</div>
                                                            <div style={styles.commentText}>{c.content}</div>
                                                        </div>
                                                        <div style={styles.commentTime}>{formatTime(c.createdAt)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Create Post */}
            {showCreatePost && (
                <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowCreatePost(false)}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Tạo bài viết mới</h3>
                            <button style={styles.closeModalBtn} onClick={() => setShowCreatePost(false)}><X /></button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.modalAuthorRow}>
                                <img src={userData?.avatar} style={styles.modalAvatar} alt="me" />
                                <div>
                                    <div style={styles.modalAuthorName}>{userData?.fullName}</div>
                                    <div style={styles.modalPostTo}>Đăng trong sự kiện: {eventData?.title}</div>
                                </div>
                            </div>
                            <textarea
                                style={styles.postTextarea}
                                placeholder="Bạn đang nghĩ gì về sự kiện này?"
                                value={postContent}
                                onChange={e => setPostContent(e.target.value)}
                                autoFocus
                            />

                            {previewImages.length > 0 && (
                                <div style={styles.previewContainer}>
                                    {previewImages.map((url, i) => (
                                        <div key={i} style={styles.previewImageWrapper}>
                                            <img src={url} style={styles.previewImage} alt="preview" />
                                            <button style={styles.removeImageBtn} onClick={() => removePreviewImage(i)}><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={styles.addToPost}>
                                <span style={styles.addToPostLabel}>Thêm vào bài viết:</span>
                                <button style={styles.addImageBtn} onClick={() => fileInputRef.current?.click()}>
                                    <ImageIcon size={20} color="#45C960" />
                                </button>
                                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button
                                style={{
                                    ...styles.submitBtn,
                                    opacity: !postContent.trim() ? 0.5 : 1,
                                    cursor: !postContent.trim() ? 'not-allowed' : 'pointer'
                                }}
                                onClick={handleCreatePost}
                                disabled={submittingPost || !postContent.trim()}
                            >
                                {submittingPost ? <><Loader2 size={18} className="animate-spin" /> Đang đăng...</> : 'Đăng bài'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div style={styles.imageViewerOverlay} onClick={() => setSelectedImage(null)}>
                    <button style={styles.closeImageBtn} onClick={() => setSelectedImage(null)}><X size={24} /></button>
                    <img src={selectedImage} style={styles.fullImage} alt="full size" onClick={e => e.stopPropagation()} />
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobile && sidebarOpen && (
                <div style={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
};

// ==================== STYLES ====================
const SidebarLink = ({ icon, label, active = false, onClick }: any) => (
    <div style={active ? styles.navItemActive : styles.navItem} onClick={onClick}>
        <span style={styles.navIcon}>{icon}</span>
        <span>{label}</span>
    </div>
);

const styles: { [key: string]: React.CSSProperties } = {
    layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#F1F5F9', width: '100vw', overflow: 'hidden' },
    sidebar: {
        width: '280px', backgroundColor: '#FFF', borderRight: '1px solid #E2E8F0', display: 'flex',
        flexDirection: 'column', height: '100vh', position: 'fixed', zIndex: 100, transition: 'transform 0.3s ease', left: 0, top: 0
    },
    sidebarOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 },
    sidebarHeader: { padding: '24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    brandTitle: { fontSize: '24px', fontWeight: 'bold', color: '#343a40', margin: 0 },
    navMenu: { padding: '16px', flex: 1 },
    navItem: { display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#64748B', cursor: 'pointer', borderRadius: '14px', marginBottom: '4px', fontSize: '15px', fontWeight: '500' },
    navItemActive: { display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#007bff', backgroundColor: '#F0F7FF', fontWeight: '700', borderRadius: '14px', marginBottom: '4px', fontSize: '15px', boxShadow: '0 2px 10px rgba(0, 123, 255, 0.08)' },
    navIcon: { marginRight: '12px', display: 'flex', alignItems: 'center' },
    sidebarFooter: { padding: '20px', borderTop: '1px solid #F1F5F9' },
    userCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '12px', cursor: 'pointer' },
    sidebarAvatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
    userInfo: { flex: 1, minWidth: 0 },
    userName: { fontSize: '14px', fontWeight: '700', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    userEmail: { fontSize: '12px', color: '#94A3B8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease', width: '100%' },
    topHeader: { height: '70px', backgroundColor: '#FFF', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 80 },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
    menuBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' },
    headerTitle: { fontSize: '20px', fontWeight: '800', margin: 0, color: '#0F172A' },
    headerSub: { fontSize: '13px', color: '#64748B', margin: 0, marginTop: '2px' },
    iconBtn: { background: '#F8FAFC', border: '1px solid #E2E8F0', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' },
    notificationBadge: { position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#EF4444', color: '#FFF', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px' },
    miniAvatar: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' },
    scrollArea: { padding: '24px', flex: 1, overflowY: 'auto', overflowX: 'hidden' },
    eventBanner: { borderRadius: '16px', padding: '40px', marginBottom: '24px', backgroundSize: 'cover', backgroundPosition: 'center', color: '#FFF', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    eventBannerTitle: { fontSize: '28px', fontWeight: '800', marginBottom: '12px', margin: 0 },
    eventBannerDesc: { fontSize: '15px', lineHeight: '1.6', marginBottom: '16px', opacity: 0.95, maxWidth: '800px' },
    eventMeta: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', opacity: 0.9 },
    feedContainer: { maxWidth: '900px', margin: '0 auto', width: '100%' },
    createPostCard: { backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', border: '1px solid #E2E8F0', marginBottom: '24px' },
    createPostAvatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
    createPostInput: { flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #E2E8F0', textAlign: 'left', color: '#94A3B8', backgroundColor: '#F8FAFC', cursor: 'pointer', fontSize: '15px' },
    postsContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
    postCard: { backgroundColor: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    postHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-start' },
    postAuthor: { display: 'flex', gap: '12px' },
    postAvatar: { width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' },
    postAuthorName: { fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: '#0F172A' },
    pinnedBadge: { fontSize: '11px', color: '#007bff', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' },
    postTime: { fontSize: '13px', color: '#94A3B8' },
    postMenuBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px', color: '#64748B' },
    postContent: { marginBottom: '15px' },
    postText: { fontSize: '15px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' },
    editContainer: { display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#F8FAFC', padding: '15px', borderRadius: '12px', border: '1px solid #CBD5E1' },
    editTextarea: { width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontFamily: 'inherit', fontSize: '15px', outline: 'none' },
    editActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    cancelEditBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer', fontWeight: 600 },
    saveEditBtn: { padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#007bff', color: '#FFF', cursor: 'pointer', fontWeight: 600 },

    // ẢNH
    imgGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' },
    postImg: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' },

    // ACTIONS
    postActions: { display: 'flex', borderTop: '1px solid #F1F5F9', paddingTop: '10px', gap: '10px' },
    actionBtn: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', background: 'none', border: 'none', color: '#64748B', fontWeight: 600, cursor: 'pointer' },

    loadingFull: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },

    postMenu: {
        position: 'absolute',
        right: '0',
        top: '40px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '8px',
        zIndex: 1000,
        minWidth: '180px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)'
    },
    postMenuItem: {
        padding: '12px 15px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        borderRadius: '8px',
        transition: 'background 0.2s',
    },
    postImagesGrid: { display: 'grid', gap: '8px', borderRadius: '12px', overflow: 'hidden', marginTop: '12px' },
    postImageWrapper: { aspectRatio: '16/10', backgroundColor: '#F1F5F9', overflow: 'hidden', borderRadius: '8px' },
    postImage: { width: '100%', height: '100%', objectFit: 'cover' },
    imageOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    imageOverlayText: { color: '#FFF', fontSize: '28px', fontWeight: '700' },
    postStats: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '13px', color: '#64748B', borderBottom: '1px solid #F1F5F9' },
    statText: { fontSize: '13px', color: '#64748B' },
    commentsSection: { marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' },
    commentInputSection: { display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' },
    commentInputAvatar: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
    commentInputWrapper: { flex: 1, display: 'flex', gap: '8px', alignItems: 'center' },
    commentInput: { flex: 1, padding: '10px 16px', borderRadius: '20px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', backgroundColor: '#F8FAFC' },
    sendCommentBtn: { backgroundColor: '#007bff', color: '#FFF', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    commentItem: { display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' },
    commentAvatar: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
    commentBody: { flex: 1, minWidth: 0 },
    commentBubble: { backgroundColor: '#F1F5F9', borderRadius: '16px', padding: '10px 14px', display: 'inline-block', maxWidth: '100%' },
    commentAuthor: { fontWeight: '700', fontSize: '13px', marginBottom: '2px', color: '#0F172A' },
    commentText: { fontSize: '14px', lineHeight: '1.5', color: '#334155', wordWrap: 'break-word' },
    commentTime: { fontSize: '11px', color: '#94A3B8', marginTop: '6px', paddingLeft: '8px' },

    // UPDATE POST STYLES
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(63, 63, 63, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' },
    modalContent: { backgroundColor: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' },
    modalHeader: { padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '20px', fontWeight: '700', margin: 0, color: '#0F172A' },
    closeModalBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
    modalBody: { padding: '24px', flex: 1, overflowY: 'auto' },
    modalAuthorRow: { display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' },
    modalAvatar: { width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' },
    modalAuthorName: { fontSize: '15px', fontWeight: '700', color: '#0F172A' },
    modalPostTo: { fontSize: '13px', color: '#64748B', marginTop: '2px' },
    postTextarea: { width: '100%', minHeight: '150px', border: 'none', outline: 'none', padding: '12px 0', fontSize: '15px', resize: 'none', fontFamily: 'inherit', lineHeight: '1.6' },
    previewContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '16px' },
    previewImageWrapper: { position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F1F5F9' },
    previewImage: { width: '100%', height: '100%', objectFit: 'cover' },
    removeImageBtn: { position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#FFF', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    addToPost: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px' },
    addToPostLabel: { fontSize: '14px', fontWeight: '600', color: '#0F172A', flex: 1 },
    addImageBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' },
    modalFooter: { padding: '16px 24px', borderTop: '1px solid #E2E8F0' },
    submitBtn: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    notificationPopup: { position: 'absolute', top: '50px', right: 0, width: '360px', maxWidth: '90vw', backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '400px', overflowY: 'auto' },
    notificationHeader: { fontSize: '16px', fontWeight: '700', padding: '12px', color: '#0F172A' },
    notificationItem: { padding: '12px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', borderRadius: '8px' },
    notificationSubject: { fontWeight: '600', fontSize: '14px', marginBottom: '4px', color: '#0F172A' },
    notificationText: { fontSize: '13px', color: '#64748B', lineHeight: '1.5' },
    emptyNotification: { padding: '32px 12px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' },
    imageViewerOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' },
    closeImageBtn: { position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    fullImage: { maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }
};

export default EventCommunicationDetail;