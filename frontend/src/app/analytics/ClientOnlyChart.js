"use client";
import {
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Scatter,
} from "recharts";

const monthlyData = [
  { name: "Jan", income: 4000, expense: 2400 },
  { name: "Feb", income: 3000, expense: 1398 },
  { name: "Mar", income: 5000, expense: 3800 },
  { name: "Apr", income: 4780, expense: 2908 },
];

const pieData = [
  { name: "Income", value: 25000 },
  { name: "Expense", value: 12000 },
];

const weeklyData = [
  { day: "Mon", value: 1000 },
  { day: "Tue", value: 1200 },
  { day: "Wed", value: 900 },
  { day: "Thu", value: 1600 },
  { day: "Fri", value: 1400 },
  { day: "Sat", value: 1700 },
  { day: "Sun", value: 1500 },
];

const radarData = [
  { subject: "Sales", A: 120, B: 110, fullMark: 150 },
  { subject: "Admin", A: 98, B: 130, fullMark: 150 },
  { subject: "HR", A: 86, B: 130, fullMark: 150 },
  { subject: "IT", A: 99, B: 100, fullMark: 150 },
];

const serviceStatusData = [
  { name: "Completed", value: 75 },
  { name: "Pending", value: 25 },
];

const incomeTimeData = [
  { label: "Today", income: 1500 },
  { label: "Week", income: 9800 },
  { label: "Month", income: 25000 },
  { label: "Year", income: 210000 },
];

const COLORS = ["#28a745", "#dc3545"];

export default function ClientOnlyChart() {
  return (
    <div className="analytics-grid">

      <div className="chart-box">
        <h3>📊 Monthly Bar Chart</h3>
        <BarChart width={300} height={200} data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#28a745" />
          <Bar dataKey="expense" fill="#dc3545" />
        </BarChart>
      </div>

      <div className="chart-box">
        <h3>🥧 Income vs Expense Pie</h3>
        <PieChart width={300} height={200}>
          <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} label dataKey="value">
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div className="chart-box">
        <h3>✅ Service Completion Status</h3>
        <PieChart width={300} height={200}>
          <Pie data={serviceStatusData} cx="50%" cy="50%" outerRadius={70} label dataKey="value">
            <Cell fill="#28a745" />
            <Cell fill="#ffc107" />
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div className="chart-box">
        <h3>💰 Income Summary</h3>
        <BarChart width={300} height={200} data={incomeTimeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#007bff" />
        </BarChart>
      </div>

      <div className="chart-box full-width">
        <h3>📈 Weekly Line Chart</h3>
        <LineChart width={600} height={200} data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#007bff" strokeWidth={2} />
        </LineChart>
      </div>

      <div className="chart-box full-width">
        <h3>🌊 Area Chart</h3>
        <AreaChart width={600} height={200} data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#17a2b8" fill="#cce5ff" />
        </AreaChart>
      </div>

      <div className="chart-box full-width">
        <h3>🧭 Radar Chart</h3>
        <RadarChart cx={300} cy={120} outerRadius={90} width={600} height={250} data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          <Radar name="Dept A" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Radar name="Dept B" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
          <Legend />
        </RadarChart>
      </div>

      <div className="chart-box full-width">
        <h3>🔧 Composed Chart</h3>
        <ComposedChart width={600} height={200} data={monthlyData}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="expense" fill="#fdd835" stroke="#fbc02d" />
          <Bar dataKey="income" barSize={20} fill="#43a047" />
          <Line type="monotone" dataKey="income" stroke="#1e88e5" />
          <Scatter dataKey="expense" fill="red" />
        </ComposedChart>
      </div>

    </div>
  );
}
