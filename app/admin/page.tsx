import { cookies } from 'next/headers';
import AdminLogin from '../../components/admin/AdminLogin';
import Dashboard from '../../components/admin/Dashboard';

export default async function AdminPage() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (session && session.value === 'true') {
        return <Dashboard />;
    }

    return <AdminLogin />;
}
