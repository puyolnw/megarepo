import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AcademicYearManagement = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [formData, setFormData] = useState({
    year: '',
    year_thai: '',
    start_date: '',
    end_date: '',
    is_active: true
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAcademicYears();
    }
  }, [user]);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/academic-years');
      if (response.data.success) {
        setAcademicYears(response.data.data.academicYears || []);
      } else {
        setError('ไม่สามารถโหลดข้อมูลปีการศึกษาได้');
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      setError('ไม่สามารถโหลดข้อมูลปีการศึกษาได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const response = await api.post('/admin/academic-years', formData);
      if (response.data.success) {
        setSuccess('สร้างปีการศึกษาสำเร็จ!');
        fetchAcademicYears();
        closeModals();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('ไม่สามารถสร้างปีการศึกษาได้');
      }
    } catch (error) {
      console.error('Error creating academic year:', error);
      setError('ไม่สามารถสร้างปีการศึกษาได้');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const response = await api.put(`/admin/academic-years/${selectedYear.id}`, formData);
      if (response.data.success) {
        setSuccess('แก้ไขปีการศึกษาสำเร็จ!');
        fetchAcademicYears();
        closeModals();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('ไม่สามารถแก้ไขปีการศึกษาได้');
      }
    } catch (error) {
      console.error('Error editing academic year:', error);
      setError('ไม่สามารถแก้ไขปีการศึกษาได้');
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      const response = await api.delete(`/admin/academic-years/${selectedYear.id}`);
      if (response.data.success) {
        setSuccess('ลบปีการศึกษาสำเร็จ!');
        fetchAcademicYears();
        closeModals();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('ไม่สามารถลบปีการศึกษาได้');
      }
    } catch (error) {
      console.error('Error deleting academic year:', error);
      setError('ไม่สามารถลบปีการศึกษาได้');
    }
  };

  const openCreateModal = () => {
    setFormData({
      year: '',
      year_thai: '',
      start_date: '',
      end_date: '',
      is_active: true
    });
    setShowCreateModal(true);
  };

  const openEditModal = (year) => {
    setSelectedYear(year);
    setFormData({
      year: year.year,
      year_thai: year.year_thai,
      start_date: year.start_date,
      end_date: year.end_date,
      is_active: year.is_active
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (year) => {
    setSelectedYear(year);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedYear(null);
    setFormData({
      year: '',
      year_thai: '',
      start_date: '',
      end_date: '',
      is_active: true
    });
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดข้อมูลปีการศึกษา...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1 text-primary">
                <i className="fas fa-calendar-alt me-2"></i>
                จัดการปีการศึกษา
              </h2>
              <p className="text-muted mb-0">จัดการข้อมูลปีการศึกษาในระบบ</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={openCreateModal}
            >
              <i className="fas fa-plus me-2"></i>
              เพิ่มปีการศึกษา
            </button>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Academic Years Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0">
          <h6 className="mb-0 text-dark">
            <i className="fas fa-list me-2"></i>
            รายการปีการศึกษา
          </h6>
        </div>
        <div className="card-body p-0">
          {academicYears.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="fas fa-calendar-times fa-3x mb-3"></i>
                <p>ไม่พบข้อมูลปีการศึกษา</p>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0">ปีการศึกษา</th>
                    <th className="border-0">ชื่อภาษาไทย</th>
                    <th className="border-0">วันที่เริ่มต้น</th>
                    <th className="border-0">วันที่สิ้นสุด</th>
                    <th className="border-0">สถานะ</th>
                    <th className="border-0">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {academicYears.map((year) => (
                    <tr key={year.id}>
                      <td className="fw-semibold">{year.year}</td>
                      <td>{year.year_thai}</td>
                      <td>{new Date(year.start_date).toLocaleDateString('th-TH')}</td>
                      <td>{new Date(year.end_date).toLocaleDateString('th-TH')}</td>
                      <td>
                        <span className={`badge ${year.is_active ? 'bg-success' : 'bg-secondary'}`}>
                          {year.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditModal(year)}
                            title="แก้ไข"
                          >
                            <i className="fas fa-edit" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openDeleteModal(year)}
                            title="ลบ"
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div className="modal-backdrop show" onClick={closeModals} />
          <div className="modal show" tabIndex={-1} role="dialog" style={{ display: 'block' }}>
            <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">เพิ่มปีการศึกษา</h5>
                  <button type="button" className="btn-close" onClick={closeModals}></button>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">ปีการศึกษา *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.year}
                            onChange={(e) => setFormData({...formData, year: e.target.value})}
                            placeholder="เช่น 2568"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">ชื่อภาษาไทย *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.year_thai}
                            onChange={(e) => setFormData({...formData, year_thai: e.target.value})}
                            placeholder="เช่น ปีการศึกษา 2568"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">วันที่เริ่มต้น *</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.start_date}
                            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">วันที่สิ้นสุด *</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.end_date}
                            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        />
                        <label className="form-check-label">
                          ใช้งาน
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModals}>
                      ยกเลิก
                    </button>
                    <button type="submit" className="btn btn-primary">
                      บันทึก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedYear && (
        <>
          <div className="modal-backdrop show" onClick={closeModals} />
          <div className="modal show" tabIndex={-1} role="dialog" style={{ display: 'block' }}>
            <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">แก้ไขปีการศึกษา: {selectedYear.year}</h5>
                  <button type="button" className="btn-close" onClick={closeModals}></button>
                </div>
                <form onSubmit={handleEdit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">ปีการศึกษา *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.year}
                            onChange={(e) => setFormData({...formData, year: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">ชื่อภาษาไทย *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.year_thai}
                            onChange={(e) => setFormData({...formData, year_thai: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">วันที่เริ่มต้น *</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.start_date}
                            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">วันที่สิ้นสุด *</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.end_date}
                            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        />
                        <label className="form-check-label">
                          ใช้งาน
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModals}>
                      ยกเลิก
                    </button>
                    <button type="submit" className="btn btn-primary">
                      บันทึกการแก้ไข
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedYear && (
        <>
          <div className="modal-backdrop show" onClick={closeModals} />
          <div className="modal show" tabIndex={-1} role="dialog" style={{ display: 'block' }}>
            <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">ลบปีการศึกษา: {selectedYear.year}</h5>
                  <button type="button" className="btn-close" onClick={closeModals}></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>คำเตือน:</strong> การลบปีการศึกษาจะไม่สามารถย้อนกลับได้
                  </div>
                  <p>คุณแน่ใจหรือไม่ที่จะลบปีการศึกษา <strong>"{selectedYear.year_thai}"</strong>?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModals}>
                    ยกเลิก
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>
                    ลบปีการศึกษา
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AcademicYearManagement;
