import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import '../../styles/reports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MemberReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    program: '',
    enrollmentYear: '',
    academicYear: ''
  });
  const [academicYears, setAcademicYears] = useState([]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAcademicYears();
      fetchData();
    }
  }, [user, filters]);

  const fetchAcademicYears = async () => {
    try {
      const response = await api.get('/admin/academic-years');
      if (response.data.success) {
        setAcademicYears(response.data.data.academicYears || []);
        const currentYear = response.data.data.academicYears.find(year => year.is_active);
        if (currentYear && !filters.academicYear) {
          setFilters(prev => ({
            ...prev,
            academicYear: currentYear.year
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reports/members', { params: filters });
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching member reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      program: '',
      enrollmentYear: '',
      academicYear: ''
    });
  };

  const exportToExcel = async () => {
    try {
      const response = await api.get('/admin/reports/members/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `member-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await api.get('/admin/reports/members/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `member-reports-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  // Chart configurations
  const academicYearProgressConfig = {
    labels: data?.academicYearProgress?.map(item => item.academic_year) || [],
    datasets: [{
      label: 'ชั่วโมงสะสม',
      data: data?.academicYearProgress?.map(item => item.totalHours) || [],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      fill: true
    }]
  };

  const academicYearActivityConfig = {
    labels: data?.academicYearActivities?.map(item => item.academic_year) || [],
    datasets: [{
      label: 'จำนวนกิจกรรม',
      data: data?.academicYearActivities?.map(item => item.activityCount) || [],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: true
    }]
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-primary mb-1">
            <i className="fas fa-graduation-cap me-2"></i>
            รายงานนักศึกษา
          </h2>
          <p className="text-muted mb-0">ข้อมูลการสะสมชั่วโมงและสถิตินักศึกษา</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-success export-btn"
            onClick={exportToExcel}
            disabled={loading}
          >
            <i className="fas fa-file-excel me-1"></i>
            Excel
          </button>
          <button 
            className="btn btn-danger export-btn"
            onClick={exportToPDF}
            disabled={loading}
          >
            <i className="fas fa-file-pdf me-1"></i>
            PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="filter-header">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <i className="fas fa-filter me-2"></i>
              ตัวกรองข้อมูล
            </h6>
            <div className="d-flex align-items-center gap-3">
              {Object.values(filters).filter(v => v).length > 0 && (
                <span className="active-filter-badge">
                  ใช้งานตัวกรอง: {Object.entries(filters)
                    .filter(([key, value]) => value)
                    .map(([key, value]) => {
                      if (key === 'academicYear') {
                        const year = academicYears.find(y => y.year === value);
                        return year ? year.year_thai : value;
                      }
                      return value;
                    })
                    .join(', ')}
                </span>
              )}
              <button
                className="reset-btn"
                onClick={resetFilters}
                disabled={loading}
              >
                <i className="fas fa-undo me-1"></i>
                รีเซ็ต
              </button>
            </div>
          </div>
        </div>
        <div className="filter-body">
          <div className="filter-row">
            <div className="row">
              <div className="col-md-3">
                <label className="filter-label">ปีการศึกษา</label>
                <select
                  className="form-select filter-control"
                  name="academicYear"
                  value={filters.academicYear}
                  onChange={handleFilterChange}
                >
                  <option value="">ทั้งหมด</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.year}>{year.year_thai}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="filter-label">สาขาวิชา</label>
                <select
                  className="form-select filter-control"
                  name="program"
                  value={filters.program}
                  onChange={handleFilterChange}
                >
                  <option value="">ทั้งหมด</option>
                  {data?.programs?.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="filter-label">ปีที่เข้าเรียน</label>
                <select
                  className="form-select filter-control"
                  name="enrollmentYear"
                  value={filters.enrollmentYear}
                  onChange={handleFilterChange}
                >
                  <option value="">ทั้งหมด</option>
                  {data?.enrollmentYears?.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="filter-label">วันที่เริ่มต้น</label>
                <input
                  type="date"
                  className="form-control filter-control"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
          <div className="filter-row">
            <div className="row">
              <div className="col-md-3">
                <label className="filter-label">วันที่สิ้นสุด</label>
                <input
                  type="date"
                  className="form-control filter-control"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-9">
                {/* Empty space for alignment */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner-border loading-spinner text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card summary-card-primary">
              <div className="card-body">
                <div className="text-primary icon">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="text-primary number">{data.summary?.totalMembers || 0}</h3>
                <p className="label">นักศึกษาทั้งหมด</p>
              </div>
            </div>
            <div className="summary-card summary-card-success">
              <div className="card-body">
                <div className="text-success icon">
                  <i className="fas fa-clock"></i>
                </div>
                <h3 className="text-success number">{data.summary?.totalHours || 0}</h3>
                <p className="label">ชั่วโมงสะสมทั้งหมด</p>
              </div>
            </div>
            <div className="summary-card summary-card-info">
              <div className="card-body">
                <div className="text-info icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="text-info number">{data.summary?.averageHours || 0}</h3>
                <p className="label">ชั่วโมงเฉลี่ยต่อคน</p>
              </div>
            </div>
            <div className="summary-card summary-card-warning">
              <div className="card-body">
                <div className="text-warning icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <h3 className="text-warning number">{data.academicYearActivities?.length || 0}</h3>
                <p className="label">ปีการศึกษาที่มีกิจกรรม</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="chart-card">
                <div className="chart-header">
                  <h6 className="mb-0">
                    <i className="fas fa-chart-bar me-2"></i>
                    ชั่วโมงสะสมตามปีการศึกษา
                  </h6>
                </div>
                <div className="chart-body">
                  <Bar 
                    data={academicYearProgressConfig} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                    height={300}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="chart-card">
                <div className="chart-header">
                  <h6 className="mb-0">
                    <i className="fas fa-chart-pie me-2"></i>
                    จำนวนกิจกรรมตามปีการศึกษา
                  </h6>
                </div>
                <div className="chart-body">
                  <Bar 
                    data={academicYearActivityConfig} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Member List Table */}
          <div className="data-table-card">
            <div className="table-header">
              <h6 className="mb-0">
                <i className="fas fa-users me-2"></i>
                รายชื่อนักศึกษา
              </h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>อันดับ</th>
                    <th>รหัสนักศึกษา</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>สาขาวิชา</th>
                    <th>ปีที่เข้าเรียน</th>
                    <th>ชั่วโมงสะสม</th>
                    <th>จำนวนกิจกรรม</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topStudents?.map((student, index) => (
                    <tr key={student.user_id || index}>
                      <td>
                        <span className={`badge ${
                          index === 0 ? 'badge-rank-1' : 
                          index === 1 ? 'badge-rank-2' : 
                          index === 2 ? 'badge-rank-3' : 'badge-rank-other'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {student.user?.student_code || '-'}
                        </span>
                      </td>
                      <td className="fw-semibold">{student.user?.name || '-'}</td>
                      <td>
                        <span className="badge bg-info">
                          {student.user?.program || '-'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {student.user?.enrollment_year || '-'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {student.total_hours || 0} ชั่วโมง
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-warning">
                          {student.activity_count || 0} กิจกรรม
                        </span>
                      </td>
                      <td>
                        <span className="badge status-completed">
                          ใช้งาน
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <i className="fas fa-exclamation-triangle empty-state-icon"></i>
          <h5>ไม่พบข้อมูล</h5>
          <p className="text-muted">ไม่พบข้อมูลตามเงื่อนไขที่กำหนด</p>
        </div>
      )}
    </div>
  );
};

export default MemberReports;