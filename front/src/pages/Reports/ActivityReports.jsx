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

const ActivityReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    category: '',
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
        // Set default academic year if none selected
        if (!filters.academicYear && response.data.data.academicYears?.length > 0) {
          const currentYear = response.data.data.academicYears.find(year => year.is_active);
          if (currentYear) {
            setFilters(prev => ({
              ...prev,
              academicYear: currentYear.year
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reports/activities', { params: filters });
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching activity reports:', error);
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
      status: '',
      category: '',
      academicYear: ''
    });
  };

  const exportToExcel = async () => {
    try {
      const response = await api.get('/admin/reports/activities/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await api.get('/admin/reports/activities/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-reports-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  // Chart configurations
  const participationTrendConfig = {
    labels: data?.participationTrend?.map(trend => trend.month) || [],
    datasets: [{
      label: 'ผู้เข้าร่วม',
      data: data?.participationTrend?.map(trend => trend.participants) || [],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      fill: true
    }]
  };

  const activityStatusConfig = {
    labels: data?.activityStatus?.map(status => status.status) || [],
    datasets: [{
      data: data?.activityStatus?.map(status => status.count) || [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const topActivitiesConfig = {
    labels: data?.topActivities?.map(activity => activity.title) || [],
    datasets: [{
      label: 'ผู้เข้าร่วม',
      data: data?.topActivities?.map(activity => activity.participantCount) || [],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: true
    }]
  };

  const ratingDistributionConfig = {
    labels: ['1 ดาว', '2 ดาว', '3 ดาว', '4 ดาว', '5 ดาว'],
    datasets: [{
      label: 'จำนวนการประเมิน',
      data: data?.ratingDistribution || [],
      backgroundColor: [
        '#FF6B6B', '#FFA07A', '#FFEAA7', '#98D8C8', '#4ECDC4'
      ],
      borderWidth: 2,
      borderColor: '#fff'
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
            <i className="fas fa-calendar-alt me-2"></i>
            รายงานกิจกรรม
          </h2>
          <p className="text-muted mb-0">ข้อมูลการจัดกิจกรรมและผลตอบรับ</p>
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
                <label className="filter-label">สถานะ</label>
                <select
                  className="form-select filter-control"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">ทั้งหมด</option>
                  {data?.statuses?.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="filter-label">ประเภท</label>
                <select
                  className="form-select filter-control"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">ทั้งหมด</option>
                  {data?.categories?.map(category => (
                    <option key={category} value={category}>{category}</option>
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
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
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
                  <i className="fas fa-calendar-check"></i>
                </div>
                <h3 className="text-primary number">{data.summary?.totalActivities || 0}</h3>
                <p className="label">กิจกรรมทั้งหมด</p>
              </div>
            </div>
            <div className="summary-card summary-card-success">
              <div className="card-body">
                <div className="text-success icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="text-success number">{data.summary?.completedActivities || 0}</h3>
                <p className="label">กิจกรรมที่เสร็จสิ้น</p>
              </div>
            </div>
            <div className="summary-card summary-card-info">
              <div className="card-body">
                <div className="text-info icon">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="text-info number">{data.summary?.totalParticipants || 0}</h3>
                <p className="label">ผู้เข้าร่วมทั้งหมด</p>
              </div>
            </div>
            <div className="summary-card summary-card-warning">
              <div className="card-body">
                <div className="text-warning icon">
                  <i className="fas fa-star"></i>
                </div>
                <h3 className="text-warning number">{data.summary?.averageRating?.toFixed(1) || 0}</h3>
                <p className="label">คะแนนเฉลี่ย</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="chart-card">
                <div className="chart-header">
                  <h6 className="mb-0">
                    <i className="fas fa-chart-line me-2"></i>
                    แนวโน้มการเข้าร่วม
                  </h6>
                </div>
                <div className="chart-body">
                  <Line 
                    data={participationTrendConfig} 
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
                    การกระจายสถานะกิจกรรม
                  </h6>
                </div>
                <div className="chart-body">
                  <Pie 
                    data={activityStatusConfig} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Second Row Charts */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="chart-card">
                <div className="chart-header">
                  <h6 className="mb-0">
                    <i className="fas fa-chart-bar me-2"></i>
                    กิจกรรมยอดนิยม
                  </h6>
                </div>
                <div className="chart-body">
                  <Bar 
                    data={topActivitiesConfig} 
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
                    <i className="fas fa-star me-2"></i>
                    การกระจายคะแนนประเมิน
                  </h6>
                </div>
                <div className="chart-body">
                  <Bar 
                    data={ratingDistributionConfig} 
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

          {/* Top Activities Table */}
          <div className="data-table-card">
            <div className="table-header">
              <h6 className="mb-0">
                <i className="fas fa-trophy me-2"></i>
                อันดับกิจกรรมยอดนิยม
              </h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>อันดับ</th>
                    <th>ชื่อกิจกรรม</th>
                    <th>วันที่จัด</th>
                    <th>ปีการศึกษา</th>
                    <th>ผู้เข้าร่วม</th>
                    <th>คะแนนเฉลี่ย</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topActivities?.map((activity, index) => (
                    <tr key={activity.id || `activity-${index}`}>
                      <td>
                        <span className={`badge ${
                          index === 0 ? 'badge-rank-1' : 
                          index === 1 ? 'badge-rank-2' : 
                          index === 2 ? 'badge-rank-3' : 'badge-rank-other'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="fw-semibold">{activity.title}</td>
                      <td className="text-muted">{new Date(activity.start_date).toLocaleDateString('th-TH')}</td>
                      <td>
                        {activity.academic_year ? (
                          <span className="badge academic-year-badge">
                            {activity.academic_year}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {activity.participantCount} คน
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-warning">
                          {typeof activity.averageRating === 'number' ? activity.averageRating.toFixed(1) : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          activity.status === 'CLOSED' ? 'status-completed' :
                          activity.status === 'OPEN' ? 'status-open' :
                          activity.status === 'DRAFT' ? 'status-draft' : 'status-cancelled'
                        }`}>
                          {activity.status === 'CLOSED' ? 'เสร็จสิ้น' :
                           activity.status === 'OPEN' ? 'กำลังดำเนินการ' :
                           activity.status === 'DRAFT' ? 'ร่าง' : 'ยกเลิก'}
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
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
          <h5>ไม่พบข้อมูล</h5>
          <p className="text-muted">ไม่พบข้อมูลตามเงื่อนไขที่กำหนด</p>
        </div>
      )}
    </div>
  );
};

export default ActivityReports;