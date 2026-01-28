import React, { useState, useMemo } from "react";
import { PostEntry } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';

interface DashboardProps {
  posts: PostEntry[];
  userName: string;
  currentUserEmail: string; // Add this prop
  employeeNicknames: Map<string, string>;
}

export const Dashboard: React.FC<DashboardProps> = ({ posts, userName, employeeNicknames, currentUserEmail }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const currentUserTodayPosts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return posts.filter(post => {
      const postDate = new Date(post.timestamp);
      postDate.setHours(0, 0, 0, 0);

      return post.createdByEmail === currentUserEmail && postDate.getTime() === today.getTime();
    }).length;
  }, [posts, currentUserEmail]);

  // Data for "Your Monthly Breakdown" chart
  const { currentUserMonthlyData, uniquePostTypes } = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const daysInMonth = endDate.getDate();

    // Filter posts for current user and selected month
    const userMonthlyPosts = posts.filter(post => {
      const postDate = new Date(post.timestamp);
      return post.createdByEmail === currentUserEmail && postDate >= startDate && postDate <= endDate;
    });

    const dailyData = new Map<number, any>();
    const typeSet = new Set<string>();

    // Initialize all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      dailyData.set(day, { date: day });
    }

    // Aggregate posts by day and type
    userMonthlyPosts.forEach(post => {
      const day = new Date(post.timestamp).getDate();
      const postType = post.postType || 'Uncategorized';
      typeSet.add(postType);

      const dayData = dailyData.get(day);
      if (dayData) {
        dayData[postType] = (dayData[postType] || 0) + 1;
      }
    });

    const uniquePostTypes = Array.from(typeSet).sort();
    const finalData = Array.from(dailyData.values());

    return { currentUserMonthlyData: finalData, uniquePostTypes };
  }, [posts, currentUserEmail, selectedMonth]);
  
  // Color utility for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff84a2'];
  const getTypeColor = (index: number) => COLORS[index % COLORS.length];

  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  // ฟังก์ชันแปลง employeeCode เป็นชื่อเล่น
  const getEmployeeDisplayName = (employeeCode: string): string => {
    return employeeNicknames.get(employeeCode) || employeeCode;
  };

  // คำนวณสถิติรวมทั้งหมด
  const totalStats = useMemo(() => {
    const employeePosts = new Map<string, { code: string; count: number }>();
    
    posts.forEach(post => {
      const employeeCode = post.createdBy || 'Unknown';
      const existing = employeePosts.get(employeeCode) || { code: employeeCode, count: 0 };
      employeePosts.set(employeeCode, { ...existing, count: existing.count + 1 });
    });

    return Array.from(employeePosts.entries())
      .map(([code, data]) => ({
        name: getEmployeeDisplayName(code),
        posts: data.count,
      }))
      .sort((a, b) => b.posts - a.posts);
  }, [posts, employeeNicknames]);

  // คำนวณสถิติรายพนักงานตามเดือนที่เลือก
  const monthlyEmployeeStats = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const employeePosts = new Map<string, number>();
    
    posts.forEach(post => {
      const postDate = new Date(post.timestamp);
      if (postDate >= startDate && postDate <= endDate) {
        const employeeCode = post.createdBy || 'Unknown';
        employeePosts.set(employeeCode, (employeePosts.get(employeeCode) || 0) + 1);
      }
    });

    return Array.from(employeePosts.entries())
      .map(([code, count]) => ({
        name: getEmployeeDisplayName(code),
        posts: count,
      }))
      .sort((a, b) => b.posts - a.posts);
  }, [posts, selectedMonth, employeeNicknames]);

  // คำนวณสถิติรายวันในเดือนที่เลือก
  const dailyStats = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // วันสุดท้ายของเดือน
    
    // สร้าง map สำหรับทุกวันในเดือน
    const dailyMap = new Map<string, number>();
    for (let d = 1; d <= endDate.getDate(); d++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dailyMap.set(dateKey, 0);
    }

    // นับโพสต์แต่ละวัน
    posts.forEach(post => {
      const postDate = new Date(post.timestamp);
      if (postDate >= startDate && postDate <= endDate) {
        const dateKey = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}-${String(postDate.getDate()).padStart(2, '0')}`;
        dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
      }
    });

    return Array.from(dailyMap.entries())
      .map(([date, count]) => ({
        date: new Date(date).getDate(), // แค่วันที่
        fullDate: date,
        posts: count,
      }))
      .sort((a, b) => a.date - b.date);
  }, [posts, selectedMonth]);

  // คำนวณสถิติรายวันแยกตามพนักงาน (สำหรับกราฟรายวัน)
  const dailyEmployeeStats = useMemo(() => {
    const postDate = new Date(selectedDate);
    const startOfDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate(), 23, 59, 59);
    
    const employeePosts = new Map<string, number>();
    
    posts.forEach(post => {
      const pDate = new Date(post.timestamp);
      if (pDate >= startOfDay && pDate <= endOfDay) {
        const employeeCode = post.createdBy || 'Unknown';
        employeePosts.set(employeeCode, (employeePosts.get(employeeCode) || 0) + 1);
      }
    });

    return Array.from(employeePosts.entries())
      .map(([code, count]) => ({
        name: getEmployeeDisplayName(code),
        posts: count,
      }))
      .sort((a, b) => b.posts - a.posts);
  }, [posts, selectedDate, employeeNicknames]);

  // ตัวเลือกวันที่ในเดือน
  const dateOptions = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const options = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateValue = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(year, month - 1, day);
      const label = dateObj.toLocaleDateString('th-TH', { 
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      options.push({ value: dateValue, label });
    }
    
    return options.reverse(); // เรียงจากวันล่าสุดไปเก่าสุด
  }, [selectedMonth]);

  // สร้างตัวเลือกเดือน (6 เดือนล่าสุด)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  }, []);

  // สถิติรวม
  const totalPosts = posts.length;
  const monthPosts = dailyStats.reduce((sum, day) => sum + day.posts, 0);
  const avgPerDay = monthPosts > 0 ? (monthPosts / dailyStats.length).toFixed(1) : '0';
  const maxDayPosts = Math.max(...dailyStats.map(d => d.posts), 0);

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900">ยังไม่มีข้อมูลสถิติ</h3>
        <p className="text-slate-500 mt-1">เริ่มบันทึกโพสต์เพื่อดูสถิติ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Dashboard สถิติการโพสต์
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">โพสต์ของคุณวันนี้</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{currentUserTodayPosts}</p>
            </div>
            <div className="bg-teal-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">โพสต์ทั้งหมด</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalPosts}</p>
            </div>
            <div className="bg-indigo-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">เดือนนี้</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{monthPosts}</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">เฉลี่ย/วัน</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{avgPerDay}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">สูงสุด/วัน</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{maxDayPosts}</p>
            </div>
            <div className="bg-orange-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Stats by Employee */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">กราฟรายวัน - แยกตามพนักงาน</h3>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            {dateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {dailyEmployeeStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyEmployeeStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" label={{ value: 'จำนวนโพสต์', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                formatter={(value: number) => [`${value} โพสต์`]}
              />
              <Legend />
              <Bar 
                dataKey="posts" 
                fill="#6366f1" 
                name="จำนวนโพสต์" 
                radius={[8, 8, 0, 0]}
                label={{ 
                  position: 'inside', 
                  fill: '#ffffff', 
                  fontSize: 14, 
                  fontWeight: 'bold' 
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-400">
            <p>ไม่มีข้อมูลในวันนี้</p>
          </div>
        )}
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">สรุปรายเดือน</h3>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Daily Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              label={{ value: 'วันที่', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="#64748b"
              label={{ value: 'จำนวนโพสต์', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              formatter={(value: number) => [`${value} โพสต์`]}
              labelFormatter={(label) => `วันที่ ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="posts" 
              stroke="#6366f1" 
              strokeWidth={2}
              name="จำนวนโพสต์รวม"
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Employee Stats by Month */}
        <h3 className="text-lg font-semibold text-slate-800 mb-4">สถิติรายพนักงาน (ในเดือน{monthOptions.find(m => m.value === selectedMonth)?.label.split(' ')[0]})</h3>
        {monthlyEmployeeStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyEmployeeStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                formatter={(value: number) => [`${value} โพสต์`]}
              />
              <Legend />
              <Bar 
                dataKey="posts" 
                fill="#6366f1" 
                name="จำนวนโพสต์" 
                radius={[8, 8, 0, 0]}
                label={{ 
                  position: 'inside', 
                  fill: '#ffffff', 
                  fontSize: 14, 
                  fontWeight: 'bold' 
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-400">
            <p>ไม่มีข้อมูลในเดือนนี้</p>
          </div>
        )}
      </div>

      {/* User's Monthly Breakdown by Post Type */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">สรุปโพสต์รายวันของคุณ (เดือน{monthOptions.find(m => m.value === selectedMonth)?.label.split(' ')[0]})</h3>
        {uniquePostTypes.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentUserMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" label={{ value: 'วันที่', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                formatter={(value: number, name: string) => [`${value} โพสต์`, name]}
                labelFormatter={(label) => `วันที่ ${label}`}
              />
              <Legend />
              {uniquePostTypes.map((postType, index) => (
                <Bar 
                  key={postType} 
                  dataKey={postType} 
                  stackId="a" 
                  fill={getTypeColor(index)} 
                  name={postType} 
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-400">
            <p>คุณยังไม่มีโพสต์ในเดือนนี้</p>
          </div>
        )}
      </div>
    </div>
  );
};
