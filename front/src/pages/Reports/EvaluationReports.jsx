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

const EvaluationReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    activityId: '',
    ratingRange: '',
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
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reports/evaluations', { params: filters });
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching evaluation reports:', error);
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
      activityId: '',
      ratingRange: '',
      academicYear: ''
    });
  };

  const exportToExcel = async () => {
    try {
      const response = await api.get('/admin/reports/evaluations/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `evaluation-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await api.get('/admin/reports/evaluations/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `evaluation-reports-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  // Chart configurations
  const ratingTrendConfig = {
    labels: data?.ratingTrend?.map(trend => trend.month) || [],
    datasets: [{
      label: 'คะแนนเฉลี่ย',
      data: data?.ratingTrend?.map(trend => trend.overallRating) || [],
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      fill: true
    }]
  };

  const ratingDistributionConfig = {
    labels: ['1 ดาว', '2 ดาว', '3 ดาว', '4 ดาว', '5 ดาว'],
    datasets: [{
      data: data?.ratingDistribution || [0, 0, 0, 0, 0],
      backgroundColor: [
        '#FF6B6B', '#FFA07A', '#FFEAA7', '#98D8C8', '#4ECDC4'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const activityRatingConfig = {
    labels: data?.topRatedActivities?.slice(0, 8).map(activity => 
      activity.title.length > 20 ? activity.title.substring(0, 20) + '...' : activity.title
    ) || [],
    datasets: [{
      label: 'คะแนนเฉลี่ย',
      data: data?.topRatedActivities?.slice(0, 8).map(activity => activity.overallRating) || [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)',
        'rgba(83, 102, 255, 1)'
      ],
      borderWidth: 2
    }]
  };

  // New chart: Rating by Category
  const ratingByCategoryConfig = {
    labels: ['ความสนุก', 'การเรียนรู้', 'การจัดงาน', 'สถานที่'],
    datasets: [{
      label: 'คะแนนเฉลี่ย',
      data: [
        data?.summary?.averageFunRating || 0,
        data?.summary?.averageLearningRating || 0,
        data?.summary?.averageOrganizationRating || 0,
        data?.summary?.averageVenueRating || 0
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 205, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 2
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
            <i className="fas fa-star me-2"></i>
            รายงานการประเมิน
          </h2>
          <p className="text-muted mb-0">ข้อมูลการประเมินและความคิดเห็นของนักศึกษา</p>
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
                      if (key === 'ratingRange') {
                        return `คะแนน ${value}`;
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
                <label className="filter-label">กิจกรรม</label>
                <select
                  className="form-select filter-control"
                  name="activityId"
                  value={filters.activityId}
                  onChange={handleFilterChange}
                >
                  <option value="">ทั้งหมด</option>
                  {data?.activities?.map(activity => (
                    <option key={activity.id} value={activity.id}>{activity.title}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="filter-label">ช่วงคะแนน</label>
                <select
                  className="form-select filter-control"
                  name="ratingRange"
                  value={filters.ratingRange}
                  onChange={handleFilterChange}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="1-2">1-2 ดาว</option>
                  <option value="3">3 ดาว</option>
                  <option value="4-5">4-5 ดาว</option>
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
                  <i className="fas fa-comments"></i>
                </div>
                <h3 className="text-primary number">{data.summary?.totalEvaluations || 0}</h3>
                <p className="label">การประเมินทั้งหมด</p>
              </div>
            </div>
            <div className="summary-card summary-card-success">
              <div className="card-body">
                <div className="text-success icon">
                  <i className="fas fa-star"></i>
                </div>
                <h3 className="text-success number">{data.summary?.averageOverallRating?.toFixed(1) || 0}</h3>
                <p className="label">คะแนนเฉลี่ย</p>
              </div>
            </div>
            <div className="summary-card summary-card-info">
              <div className="card-body">
                <div className="text-info icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <h3 className="text-info number">{data.activities?.length || 0}</h3>
                <p className="label">กิจกรรมที่ถูกประเมิน</p>
              </div>
            </div>
            <div className="summary-card summary-card-warning">
              <div className="card-body">
                <div className="text-warning icon">
                  <i className="fas fa-percentage"></i>
                </div>
                <h3 className="text-warning number">85.5%</h3>
                <p className="label">อัตราการตอบกลับ</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="chart-card">
                <div className="chart-header">
                  <h6 className="mb-0">
                    <i className="fas fa-trophy me-2"></i>
                    กิจกรรมยอดนิยมตามคะแนน
                  </h6>
                </div>
                <div className="chart-body">
                  <Bar 
                    data={activityRatingConfig} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            title: function(context) {
                              const fullTitle = data?.topRatedActivities?.[context[0].dataIndex]?.title || '';
                              return fullTitle;
                            },
                            label: function(context) {
                              return `คะแนนเฉลี่ย: ${context.parsed.y.toFixed(1)}/5.0`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 5,
                          ticks: {
                            stepSize: 1,
                            callback: function(value) {
                              return value + ' ดาว';
                            }
                          }
                        },
                        x: {
                          ticks: {
                            maxRotation: 45,
                            minRotation: 45
                          }
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
                    <i className="fas fa-star me-2"></i>
                    คะแนนเฉลี่ยตามหมวดหมู่
                  </h6>
                </div>
                <div className="chart-body">
                  <Bar 
                    data={ratingByCategoryConfig} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `คะแนนเฉลี่ย: ${context.parsed.y.toFixed(1)}/5.0`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 5,
                          ticks: {
                            stepSize: 1,
                            callback: function(value) {
                              return value + ' ดาว';
                            }
                          }
                        }
                      }
                    }}
                    height={300}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Activity Ratings Table */}
          <div className="data-table-card">
            <div className="table-header">
              <h6 className="mb-0">
                <i className="fas fa-trophy me-2"></i>
                คะแนนประเมินตามกิจกรรม
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
                    <th>จำนวนการประเมิน</th>
                    <th>คะแนนเฉลี่ย</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topRatedActivities?.map((activity, index) => (
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
                          {activity.reviewCount} รายการ
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-warning me-2">
                            {activity.overallRating?.toFixed(1) || 'N/A'}
                          </span>
                          <div className="text-warning">
                            {[...Array(5)].map((_, i) => (
                              <i 
                                key={i} 
                                className={`fas fa-star ${i < Math.floor(activity.overallRating || 0) ? '' : 'text-muted'}`}
                                style={{ fontSize: '0.8rem' }}
                              ></i>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge status-completed">
                          เสร็จสิ้น
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

export default EvaluationReports;