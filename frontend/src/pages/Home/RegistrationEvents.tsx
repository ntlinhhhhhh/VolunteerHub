import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Search, Filter, Calendar, MapPin, User, Clock,
    CheckCircle, XCircle, AlertCircle, Loader2, ChevronDown,
    Eye, X, Check, Ban, MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Registration {
    id: string;
    registrationCode: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    status: string;
    roleName: string;
    organizerName: string;
    organizerEmail: string;
    createdAt: string;
    updatedAt: string;
    approval?: {
        reviewedBy?: string;
        reviewedAt?: string;
    };
    applicationForm?: {
        motivation?: string;
        experience?: string;
        skills?: string[];
        availability?: string;
        emergencyContact?: {
            name: string;
            phone: string;
            relationship: string;
        };
    };
}

const MyRegistrationsPage: React.FC = () => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchRegistrations();
    }, []);

    useEffect(() => {
        filterRegistrations();
    }, [searchQuery, statusFilter, registrations]);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch('http://localhost:8000/registrations/my-registrations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();

            let registrationsList = [];
            if (result.data?.items) {
                registrationsList = result.data.items;
            } else if (Array.isArray(result.data)) {
                registrationsList = result.data;
            } else if (Array.isArray(result)) {
                registrationsList = result;
            }

            setRegistrations(registrationsList);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRegistrations = () => {
        let filtered = [...registrations];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(reg =>
                reg.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                reg.registrationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                reg.eventLocation.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(reg => reg.status === statusFilter);
        }

        setFilteredRegistrations(filtered);
    };

    const getStatusConfig = (status: string) => {
        const configs: { [key: string]: { label: string; color: string; bg: string; icon: any } } = {
            pending: { label: 'Chờ duyệt', color: '#F59E0B', bg: '#FFF7ED', icon: <Clock size={16} /> },
            accepted: { label: 'Đã duyệt', color: '#3B82F6', bg: '#EFF6FF', icon: <CheckCircle size={16} /> },
            confirmed: { label: 'Đã xác nhận', color: '#10B981', bg: '#ECFDF5', icon: <Check size={16} /> },
            rejected: { label: 'Bị từ chối', color: '#EF4444', bg: '#FEF2F2', icon: <XCircle size={16} /> },
            completed: { label: 'Hoàn thành', color: '#8B5CF6', bg: '#F5F3FF', icon: <CheckCircle size={16} /> },
            cancelled: { label: 'Đã hủy', color: '#6B7280', bg: '#F9FAFB', icon: <Ban size={16} /> },
            checked_in: { label: 'Đã check-in', color: '#06B6D4', bg: '#ECFEFF', icon: <CheckCircle size={16} /> },
            checked_out: { label: 'Đã check-out', color: '#14B8A6', bg: '#F0FDFA', icon: <CheckCircle size={16} /> },
        };

        return configs[status] || { label: status, color: '#6B7280', bg: '#F9FAFB', icon: <AlertCircle size={16} /> };
    };

    const handleViewDetail = (registration: Registration) => {
        setSelectedRegistration(registration);
        setShowDetailModal(true);
    };

    const handleBack = () => {
        window.history.back();
    };

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái' },
        { value: 'pending', label: 'Chờ duyệt' },
        { value: 'accepted', label: 'Đã duyệt' },
        { value: 'confirmed', label: 'Đã xác nhận' },
        { value: 'rejected', label: 'Bị từ chối' },
        { value: 'completed', label: 'Hoàn thành' },
        { value: 'cancelled', label: 'Đã hủy' },
    ];

    const getStatistics = () => {
        return {
            total: registrations.length,
            pending: registrations.filter(r => r.status === 'pending').length,
            confirmed: registrations.filter(r => r.status === 'confirmed').length,
            completed: registrations.filter(r => r.status === 'completed').length,
        };
    };

    const stats = getStatistics();

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <Loader2 size={48} color="#007bff" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={styles.loadingText}>Đang tải...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button style={styles.backButton} onClick={handleBack}>
                    <ArrowLeft size={20} />
                </button>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>Đăng ký của tôi</h1>
                    <p style={styles.subtitle}>Quản lý tất cả các đăng ký sự kiện tình nguyện</p>
                </div>
            </div>

            {/* Statistics */}
            <div style={styles.statsContainer}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon} className="stat-icon-total">
                        <Calendar size={24} />
                    </div>
                    <div style={styles.statContent}>
                        <p style={styles.statLabel}>Tổng đăng ký</p>
                        <h3 style={styles.statValue}>{stats.total}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon} className="stat-icon-pending">
                        <Clock size={24} />
                    </div>
                    <div style={styles.statContent}>
                        <p style={styles.statLabel}>Chờ duyệt</p>
                        <h3 style={styles.statValue}>{stats.pending}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon} className="stat-icon-confirmed">
                        <Check size={24} />
                    </div>
                    <div style={styles.statContent}>
                        <p style={styles.statLabel}>Đã xác nhận</p>
                        <h3 style={styles.statValue}>{stats.confirmed}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon} className="stat-icon-completed">
                        <CheckCircle size={24} />
                    </div>
                    <div style={styles.statContent}>
                        <p style={styles.statLabel}>Hoàn thành</p>
                        <h3 style={styles.statValue}>{stats.completed}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={styles.filtersContainer}>
                <div style={styles.searchBox}>
                    <Search size={20} color="#64748B" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sự kiện, mã đăng ký..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <button
                        style={styles.filterButton}
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    >
                        <Filter size={20} />
                        <span>{statusOptions.find(opt => opt.value === statusFilter)?.label}</span>
                        <ChevronDown size={16} />
                    </button>

                    {showFilterDropdown && (
                        <div style={styles.filterDropdown}>
                            {statusOptions.map(option => (
                                <div
                                    key={option.value}
                                    style={{
                                        ...styles.filterOption,
                                        backgroundColor: statusFilter === option.value ? '#F0F7FF' : 'transparent'
                                    }}
                                    onClick={() => {
                                        setStatusFilter(option.value);
                                        setShowFilterDropdown(false);
                                    }}
                                >
                                    {option.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Count */}
            <div style={styles.resultsInfo}>
                <p style={styles.resultsText}>
                    Hiển thị <strong>{filteredRegistrations.length}</strong> kết quả
                </p>
            </div>

            {/* Registrations List */}
            {filteredRegistrations.length === 0 ? (
                <div style={styles.emptyState}>
                    <AlertCircle size={64} color="#CBD5E1" />
                    <h3 style={styles.emptyTitle}>Không tìm thấy kết quả</h3>
                    <p style={styles.emptyText}>
                        {searchQuery || statusFilter !== 'all'
                            ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                            : 'Bạn chưa đăng ký sự kiện nào'}
                    </p>
                </div>
            ) : (
                <div style={styles.registrationsList}>
                    {filteredRegistrations.map(registration => {
                        const statusConfig = getStatusConfig(registration.status);
                        return (
                            <div key={registration.id} style={styles.registrationCard}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.cardHeaderLeft}>
                                        <h3 style={styles.eventTitle}>{registration.eventTitle}</h3>
                                        <span style={styles.registrationCode}>
                                            #{registration.registrationCode}
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            backgroundColor: statusConfig.bg,
                                            color: statusConfig.color
                                        }}
                                    >
                                        {statusConfig.icon}
                                        <span>{statusConfig.label}</span>
                                    </span>
                                </div>

                                <div style={styles.cardBody}>
                                    <div style={styles.infoRow}>
                                        <Calendar size={16} color="#64748B" />
                                        <span style={styles.infoText}>
                                            {new Date(registration.eventDate).toLocaleDateString('vi-VN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <MapPin size={16} color="#64748B" />
                                        <span style={styles.infoText}>{registration.eventLocation}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <User size={16} color="#64748B" />
                                        <span style={styles.infoText}>Vai trò: {registration.roleName}</span>
                                    </div>
                                </div>

                                <div style={styles.cardFooter}>
                                    <div style={styles.organizerInfo}>
                                        <span style={styles.organizerLabel}>Tổ chức:</span>
                                        <span style={styles.organizerName}>{registration.organizerName}</span>
                                    </div>
                                    <button
                                        style={styles.detailButton}
                                        onClick={() => handleViewDetail(registration)}
                                    >
                                        <Eye size={16} />
                                        Chi tiết
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedRegistration && (
                <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Chi tiết đăng ký</h2>
                            <button style={styles.closeButton} onClick={() => setShowDetailModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            {/* Event Info */}
                            <div style={styles.modalSection}>
                                <h3 style={styles.sectionTitle}>Thông tin sự kiện</h3>
                                <div style={styles.detailGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Tên sự kiện:</span>
                                        <span style={styles.detailValue}>{selectedRegistration.eventTitle}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Mã đăng ký:</span>
                                        <span style={styles.detailValue}>{selectedRegistration.registrationCode}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Vai trò:</span>
                                        <span style={styles.detailValue}>{selectedRegistration.roleName}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Trạng thái:</span>
                                        <span
                                            style={{
                                                ...styles.statusBadge,
                                                backgroundColor: getStatusConfig(selectedRegistration.status).bg,
                                                color: getStatusConfig(selectedRegistration.status).color
                                            }}
                                        >
                                            {getStatusConfig(selectedRegistration.status).icon}
                                            <span>{getStatusConfig(selectedRegistration.status).label}</span>
                                        </span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Ngày diễn ra:</span>
                                        <span style={styles.detailValue}>
                                            {new Date(selectedRegistration.eventDate).toLocaleDateString('vi-VN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Địa điểm:</span>
                                        <span style={styles.detailValue}>{selectedRegistration.eventLocation}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Organizer Info */}
                            <div style={styles.modalSection}>
                                <h3 style={styles.sectionTitle}>Thông tin người tổ chức</h3>
                                <div style={styles.detailGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Tên:</span>
                                        <span style={styles.detailValue}>{selectedRegistration.organizerName}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Email:</span>
                                        <span style={styles.detailValue}>{selectedRegistration.organizerEmail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Application Form */}
                            {selectedRegistration.applicationForm && (
                                <div style={styles.modalSection}>
                                    <h3 style={styles.sectionTitle}>Đơn đăng ký</h3>
                                    <div style={styles.detailGrid}>
                                        {selectedRegistration.applicationForm.motivation && (
                                            <div style={styles.detailItem}>
                                                <span style={styles.detailLabel}>Động lực:</span>
                                                <span style={styles.detailValue}>
                                                    {selectedRegistration.applicationForm.motivation}
                                                </span>
                                            </div>
                                        )}
                                        {selectedRegistration.applicationForm.experience && (
                                            <div style={styles.detailItem}>
                                                <span style={styles.detailLabel}>Kinh nghiệm:</span>
                                                <span style={styles.detailValue}>
                                                    {selectedRegistration.applicationForm.experience}
                                                </span>
                                            </div>
                                        )}
                                        {selectedRegistration.applicationForm.skills && (
                                            <div style={styles.detailItem}>
                                                <span style={styles.detailLabel}>Kỹ năng:</span>
                                                <span style={styles.detailValue}>
                                                    {selectedRegistration.applicationForm.skills.join(', ')}
                                                </span>
                                            </div>
                                        )}
                                        {selectedRegistration.applicationForm.availability && (
                                            <div style={styles.detailItem}>
                                                <span style={styles.detailLabel}>Thời gian rảnh:</span>
                                                <span style={styles.detailValue}>
                                                    {selectedRegistration.applicationForm.availability}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedRegistration.applicationForm.emergencyContact && (
                                        <>
                                            <h4 style={styles.subsectionTitle}>Liên hệ khẩn cấp</h4>
                                            <div style={styles.detailGrid}>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>Tên:</span>
                                                    <span style={styles.detailValue}>
                                                        {selectedRegistration.applicationForm.emergencyContact.name}
                                                    </span>
                                                </div>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>Số điện thoại:</span>
                                                    <span style={styles.detailValue}>
                                                        {selectedRegistration.applicationForm.emergencyContact.phone}
                                                    </span>
                                                </div>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>Quan hệ:</span>
                                                    <span style={styles.detailValue}>
                                                        {selectedRegistration.applicationForm.emergencyContact.relationship}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Timeline */}
                            <div style={styles.modalSection}>
                                <h3 style={styles.sectionTitle}>Thời gian</h3>
                                <div style={styles.detailGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Đăng ký lúc:</span>
                                        <span style={styles.detailValue}>
                                            {new Date(selectedRegistration.createdAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    {selectedRegistration.approval?.reviewedAt && (
                                        <div style={styles.detailItem}>
                                            <span style={styles.detailLabel}>Duyệt lúc:</span>
                                            <span style={styles.detailValue}>
                                                {new Date(selectedRegistration.approval.reviewedAt).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .stat-icon-total {
                    background-color: #EFF6FF !important;
                    color: #3B82F6 !important;
                }

                .stat-icon-pending {
                    background-color: #FFF7ED !important;
                    color: #F59E0B !important;
                }

                .stat-icon-confirmed {
                    background-color: #ECFDF5 !important;
                    color: #10B981 !important;
                }

                .stat-icon-completed {
                    background-color: #F5F3FF !important;
                    color: #8B5CF6 !important;
                }

                @media (max-width: 768px) {
                    .statsContainer {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }

                @media (max-width: 480px) {
                    .statsContainer {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        padding: '24px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        width: '95vw',
        minWidth: '480px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
    },
    loadingText: {
        fontSize: '16px',
        color: '#64748B',
        fontWeight: '600',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
    },
    backButton: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        backgroundColor: '#FFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#475569',
        transition: 'all 0.2s',
        padding: 0
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#0F172A',
        margin: '0 0 4px 0',
    },
    subtitle: {
        fontSize: '16px',
        color: '#64748B',
        margin: 0,
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
    },
    statCard: {
        backgroundColor: '#FFF',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    statIcon: {
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: '13px',
        color: '#64748B',
        fontWeight: '600',
        margin: '0 0 4px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#0F172A',
        margin: 0,
    },
    filtersContainer: {
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
    },
    searchBox: {
        flex: 1,
        minWidth: '300px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        backgroundColor: '#FFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
    },
    searchInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        color: '#1E293B',
        backgroundColor: 'transparent',
    },
    filterButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        backgroundColor: '#FFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#475569',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    filterDropdown: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        minWidth: '200px',
        backgroundColor: '#FFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        padding: '8px',
        zIndex: 1000,
    },
    filterOption: {
        padding: '10px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#475569',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    resultsInfo: {
        marginBottom: '16px',
    },
    resultsText: {
        fontSize: '14px',
        color: '#64748B',
        margin: 0,
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        gap: '16px',
    },
    emptyTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1E293B',
        margin: 0,
    },
    emptyText: {
        fontSize: '16px',
        color: '#64748B',
        margin: 0,
        textAlign: 'center',
    },
    registrationsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '20px',
    },
    registrationCard: {
        backgroundColor: '#FFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        transition: 'all 0.3s',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        gap: '16px',
    },
    cardHeaderLeft: {
        flex: 1,
        minWidth: 0,
    },
    eventTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#0F172A',
        margin: '0 0 8px 0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    registrationCode: {
        fontSize: '13px',
        color: '#64748B',
        fontWeight: '600',
        fontFamily: 'monospace',
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '100px',
        fontSize: '13px',
        fontWeight: '700',
        flexShrink: 0,
    },
    cardBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    infoText: {
        fontSize: '14px',
        color: '#475569',
        fontWeight: '500',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '20px',
        borderTop: '1px solid #F1F5F9',
    },
    organizerInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    organizerLabel: {
        fontSize: '12px',
        color: '#94A3B8',
        fontWeight: '600',
    },
    organizerName: {
        fontSize: '14px',
        color: '#1E293B',
        fontWeight: '600',
    },
    detailButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#FFF',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px',
        borderBottom: '1px solid #E2E8F0',
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: '800',
        color: '#0F172A',
        margin: 0,
    },
    closeButton: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#F1F5F9',
        color: '#64748B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        padding: 0
    },
    modalBody: {
        padding: '32px',
        overflowY: 'auto',
    },
    modalSection: {
        marginBottom: '32px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#0F172A',
        margin: '0 0 16px 0',
        paddingBottom: '12px',
        borderBottom: '2px solid #F1F5F9',
    },
    subsectionTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#475569',
        margin: '20px 0 12px 0',
    },
    detailGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '16px',
    },
    detailItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    detailLabel: {
        fontSize: '13px',
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    detailValue: {
        fontSize: '15px',
        color: '#1E293B',
        fontWeight: '500',
        lineHeight: '1.6',
    },
};

export default MyRegistrationsPage;