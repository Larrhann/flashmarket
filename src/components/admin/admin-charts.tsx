"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface MonthlyUsers { month: string; users: number }
interface MonthlyRevenue { month: string; boosts: number; vip: number; pro: number; publications: number }

export function UserRegistrationChart({ data }: { data: MonthlyUsers[] }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="mb-4 text-sm font-semibold">Inscriptions mensuelles</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={2} dot={false} name="Nouveaux utilisateurs" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="mb-4 text-sm font-semibold">Revenus mensuels (FCFA)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="boosts" name="Boosts" fill="#f97316" stackId="a" />
          <Bar dataKey="publications" name="Publications" fill="#3b82f6" stackId="a" />
          <Bar dataKey="vip" name="VIP 1000" fill="#a855f7" stackId="a" />
          <Bar dataKey="pro" name="Pro 4000" fill="#10b981" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
