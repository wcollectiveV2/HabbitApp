import React, { useState, useRef } from 'react';
import { userService } from '../../services';
import type { UserProfile } from '../../services';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme/designSystem';

// Shared modal styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: spacing[4],
};

const modalCardStyle: React.CSSProperties = {
  backgroundColor: colors.white,
  borderRadius: borderRadius['3xl'],
  width: '100%',
  maxWidth: '384px',
  padding: spacing[6],
  boxShadow: shadows.xl,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: colors.gray[50],
  border: `1px solid ${colors.gray[200]}`,
  borderRadius: borderRadius.xl,
  padding: `${spacing[3]} ${spacing[4]}`,
  fontSize: typography.fontSize.md,
  color: colors.text.primary,
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.bold,
  color: colors.text.secondary,
  marginBottom: spacing[1],
};

const errorStyle: React.CSSProperties = {
  padding: spacing[3],
  backgroundColor: colors.errorBg,
  color: colors.error,
  fontSize: typography.fontSize.sm,
  borderRadius: borderRadius.xl,
  marginBottom: spacing[4],
};

const primaryBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: spacing[3],
  backgroundColor: colors.primary,
  color: colors.white,
  borderRadius: borderRadius.xl,
  fontWeight: typography.fontWeight.bold,
  border: 'none',
  cursor: 'pointer',
  fontSize: typography.fontSize.md,
};

const secondaryBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: spacing[3],
  backgroundColor: colors.gray[100],
  color: colors.text.primary,
  borderRadius: borderRadius.xl,
  fontWeight: typography.fontWeight.bold,
  border: 'none',
  cursor: 'pointer',
  fontSize: typography.fontSize.md,
};

const dangerBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: spacing[3],
  backgroundColor: colors.error,
  color: colors.white,
  borderRadius: borderRadius.xl,
  fontWeight: typography.fontWeight.bold,
  border: 'none',
  cursor: 'pointer',
  fontSize: typography.fontSize.md,
};

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

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[4] }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: borderRadius.full,
          overflow: 'hidden',
          border: `4px solid ${colors.white}`,
          boxShadow: shadows.xl,
        }}>
          <img 
            src={displayUrl} 
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        {uploading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: borderRadius.full,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: `2px solid ${colors.white}`,
              borderTopColor: 'transparent',
              borderRadius: borderRadius.full,
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '32px',
            height: '32px',
            backgroundColor: colors.primary,
            color: colors.white,
            borderRadius: borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: shadows.lg,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>photo_camera</span>
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{
          color: colors.primary,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.bold,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
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
    <div style={modalOverlayStyle}>
      <div style={modalCardStyle}>
        <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, marginBottom: spacing[4], color: colors.text.primary }}>Change Email</h3>
        
        <form onSubmit={handleSubmit}>
          {error && <div style={errorStyle}>{error}</div>}

          <div style={{ marginBottom: spacing[4] }}>
            <label style={labelStyle}>Current Email</label>
            <input
              type="email"
              value={currentEmail}
              disabled
              style={{ ...inputStyle, backgroundColor: colors.gray[100], color: colors.text.secondary }}
            />
          </div>

          <div style={{ marginBottom: spacing[4] }}>
            <label style={labelStyle}>New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Enter new email"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: spacing[4] }}>
            <label style={labelStyle}>Current Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Confirm your password"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: spacing[3], paddingTop: spacing[2] }}>
            <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.5 : 1 }}>
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
    <div style={modalOverlayStyle}>
      <div style={modalCardStyle}>
        <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, marginBottom: spacing[4], color: colors.text.primary }}>Change Password</h3>
        
        <form onSubmit={handleSubmit}>
          {error && <div style={errorStyle}>{error}</div>}

          <div style={{ marginBottom: spacing[4] }}>
            <label style={labelStyle}>Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: spacing[4] }}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: spacing[4] }}>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: spacing[3], paddingTop: spacing[2] }}>
            <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.5 : 1 }}>
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
    <div style={modalOverlayStyle}>
      <div style={modalCardStyle}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: colors.errorBg,
          borderRadius: borderRadius.full,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          marginBottom: spacing[4],
        }}>
          <span className="material-symbols-outlined" style={{ color: colors.error }}>warning</span>
        </div>
        
        <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, textAlign: 'center', marginBottom: spacing[2], color: colors.text.primary }}>Delete Account?</h3>
        <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing[4] }}>
          This action is permanent and cannot be undone. All your data will be deleted.
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        <div style={{ marginBottom: spacing[4] }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: spacing[4] }}>
          <label style={labelStyle}>Type "DELETE" to confirm</label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="DELETE"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: spacing[3], paddingTop: spacing[2] }}>
          <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
          <button
            onClick={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
            style={{ ...dangerBtnStyle, opacity: (loading || confirmText !== 'DELETE') ? 0.5 : 1 }}
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
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
      const [profile, stats] = await Promise.all([
        userService.getProfile(),
        userService.getStats()
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        profile,
        stats,
      };

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

  const iconBoxStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    backgroundColor: '#DBEAFE',
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: spacing[4],
  };

  const checklistItem: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalCardStyle}>
        <div style={iconBoxStyle}>
          <span className="material-symbols-outlined" style={{ color: '#3B82F6' }}>download</span>
        </div>
        
        <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, textAlign: 'center', marginBottom: spacing[2], color: colors.text.primary }}>Export Your Data</h3>
        <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing[4] }}>
          Download all your personal data in a portable JSON format (GDPR compliant).
        </p>

        {exported ? (
          <>
            <div style={{
              padding: spacing[4],
              backgroundColor: colors.successBg,
              borderRadius: borderRadius.xl,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              marginBottom: spacing[4],
            }}>
              <span className="material-symbols-outlined" style={{ color: colors.success }}>check_circle</span>
              <span style={{ color: colors.success, fontWeight: typography.fontWeight.medium }}>
                Data exported successfully!
              </span>
            </div>
            <button onClick={onClose} style={{ ...primaryBtnStyle, width: '100%' }}>Done</button>
          </>
        ) : (
          <>
            <div style={{
              padding: spacing[4],
              backgroundColor: colors.gray[50],
              borderRadius: borderRadius.xl,
              border: `1px solid ${colors.gray[100]}`,
              marginBottom: spacing[4],
            }}>
              <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[2] }}>Your export will include:</p>
              <div style={checklistItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: colors.success }}>check</span>
                Profile information
              </div>
              <div style={checklistItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: colors.success }}>check</span>
                Task history
              </div>
              <div style={checklistItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: colors.success }}>check</span>
                Challenge progress
              </div>
              <div style={checklistItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: colors.success }}>check</span>
                Statistics & achievements
              </div>
            </div>

            <div style={{ display: 'flex', gap: spacing[3] }}>
              <button onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
              <button onClick={handleExport} disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.5 : 1 }}>
                {loading ? 'Exporting...' : 'Export Data'}
              </button>
            </div>
          </>
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
    setLoading(false);
    setBlockedUsers([]);
  }, []);

  const handleUnblock = async (userId: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={{
        ...modalCardStyle,
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: spacing[4],
          borderBottom: `1px solid ${colors.gray[100]}`,
          marginBottom: spacing[4],
        }}>
          <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, color: colors.text.primary }}>Blocked Users</h3>
          <button
            onClick={onClose}
            style={{
              padding: spacing[2],
              borderRadius: borderRadius.full,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: colors.text.primary,
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '60vh' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `${spacing[8]} 0` }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: `2px solid ${colors.primary}`,
                borderTopColor: 'transparent',
                borderRadius: borderRadius.full,
                animation: 'spin 1s linear infinite',
              }} />
            </div>
          ) : blockedUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: `${spacing[8]} 0` }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: colors.gray[300], display: 'block', marginBottom: spacing[2] }}>block</span>
              <p style={{ color: colors.text.secondary }}>No blocked users</p>
            </div>
          ) : (
            blockedUsers.map(user => (
              <div key={user.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: spacing[3],
                backgroundColor: colors.gray[50],
                borderRadius: borderRadius.xl,
                marginBottom: spacing[2],
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <img 
                    src={user.avatar || `https://i.pravatar.cc/40?u=${user.id}`}
                    alt={user.name}
                    style={{ width: '40px', height: '40px', borderRadius: borderRadius.full }}
                  />
                  <span style={{ fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>{user.name}</span>
                </div>
                <button
                  onClick={() => handleUnblock(user.id)}
                  style={{
                    color: colors.primary,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.bold,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Unblock
                </button>
              </div>
            ))
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
