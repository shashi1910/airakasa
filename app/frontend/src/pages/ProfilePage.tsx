import { useAuth } from '../state/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-slate-600">Manage your account settings</p>
      </div>

      <div className="form-container max-w-md">
        <div className="mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              {user?.email.charAt(0).toUpperCase()}
            </div>
          </div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
          <div className="bg-sage-50 border-2 border-sage-200 rounded-lg px-4 py-3">
            <p className="text-slate-800 font-semibold">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-800 font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
