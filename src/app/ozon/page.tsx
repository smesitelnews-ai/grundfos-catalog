import OzonDashboard from './OzonDashboard';

export const metadata = {
  title: 'Ozon Dashboard | Grundfos',
  description: 'Панель управления товарами Ozon',
};

export default function OzonPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950">
      <OzonDashboard />
    </div>
  );
}
