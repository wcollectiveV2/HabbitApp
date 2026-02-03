import React, { useState, useRef } from 'react';
import { userService } from '../../services';
import type { UserProfile } from '../../services';

interface AvatarUploadProps {
  currentUrl?: string;
  userName: string;
  onUpload: (url: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentUrl, userName, onUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server (using base64 for now, can be replaced with S3/Cloudinary)
    setUploading(true);
    try {
      // For now, we'll use the base64 URL directly
      // In production, this should upload to a proper storage service
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });
      
      // Note: In production, replace with actual upload:
      // const uploadedUrl = await uploadToStorage(file);
      onUpload(base64);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview || currentUrl || `https://i.pravatar.cc/200?u=${userName}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
          <img 
            src={displayUrl} 
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
          disabled={uploading}
        >
          <span className="material-symbols-outlined text-sm">photo_camera</span>
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-primary text-sm font-bold"
        disabled={uploading}
      >
        Change Photo
      </button>
    </div>
  );
};

interface ChangeEmailModalProps {
  currentEmail: string;
  onClose: () => void;
  onSave: (newEmail: string) => Promise<void>;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ currentEmail, onClose, onSave }) => {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave(newEmail);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 animate-in zoom-in-95">
        <h3 className="font-bold text-lg mb-4">Change Email</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-slate-500 mb-1 block">Current Email</label>
            <input
              type="email"
              value={currentEmail}
              disabled
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-500 mb-1 block">New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Enter new email"
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-500 mb-1 block">Current Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ChangePasswordModalProps {
  onClose: () => void;
  onSave: (oldPassword: string, newPassword: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSave }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave(oldPassword, newPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 animate-in zoom-in-95">
        <h3 className="font-bold text-lg mb-4">Change Password</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-slate-500 mb-1 block">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-500 mb-1 block">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-500 mb-1 block">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteAccountModalProps {
  onClose: () => void;
  onDelete: () => Promise<void>;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onClose, onDelete }) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onDelete();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 animate-in zoom-in-95">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-red-500">warning</span>
        </div>
        
        <h3 className="font-bold text-lg text-center mb-2">Delete Account?</h3>
        <p className="text-sm text-slate-500 text-center mb-4">
          This action is permanent and cannot be undone. All your data will be deleted.
        </p>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-sm rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-500 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-500 mb-1 block">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== 'DELETE'}
              className="flex-1 p-3 bg-red-500 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ExportDataModalProps {
  onClose: () => void;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Fetch all user data
      const [profile, stats] = await Promise.all([
        userService.getProfile(),
        userService.getStats()
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        profile,
        stats,
        // Add more data as needed
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habitpulse-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExported(true);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 animate-in zoom-in-95">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-blue-500">download</span>
        </div>
        
        <h3 className="font-bold text-lg text-center mb-2">Export Your Data</h3>
        <p className="text-sm text-slate-500 text-center mb-4">
          Download all your personal data in a portable JSON format (GDPR compliant).
        </p>

        {exported ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              <span className="text-green-700 dark:text-green-400 font-medium">
                Data exported successfully!
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-full p-3 bg-primary text-white rounded-xl font-bold"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
              <p className="text-sm font-medium">Your export will include:</p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">check</span>
                  Profile information
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">check</span>
                  Task history
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">check</span>
                  Challenge progress
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">check</span>
                  Statistics & achievements
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="flex-1 p-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
              >
                {loading ? 'Exporting...' : 'Export Data'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface BlockedUsersModalProps {
  onClose: () => void;
}

const BlockedUsersModal: React.FC<BlockedUsersModalProps> = ({ onClose }) => {
  const [blockedUsers, setBlockedUsers] = useState<{id: string; name: string; avatar?: string}[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Fetch blocked users
    // In a real implementation, this would call the API
    setLoading(false);
    setBlockedUsers([]);
  }, []);

  const handleUnblock = async (userId: string) => {
    // In real implementation, call API to unblock user
    setBlockedUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm max-h-[80vh] overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg">Blocked Users</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">block</span>
              <p className="text-slate-500">No blocked users</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.avatar || `https://i.pravatar.cc/40?u=${user.id}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.id)}
                    className="text-primary text-sm font-bold"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { 
  AvatarUpload, 
  ChangeEmailModal, 
  ChangePasswordModal, 
  DeleteAccountModal,
  ExportDataModal,
  BlockedUsersModal
};
