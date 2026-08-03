import { useState, useEffect, useRef } from 'react';

interface MessageBubble {
  id: string;
  sender: 'me' | 'them';
  content: string;
  timestamp: string;
  read: boolean;
  viaWhatsApp: boolean;
  mediaType?: 'image' | 'voice' | 'location';
  mediaUrl?: string;
  mediaMeta?: string; // duration for audio, site name for location, name for image
}

interface ChatContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: MessageBubble[];
}

export const MessagesPage = () => {
  const [contacts, setContacts] = useState<ChatContact[]>([
    {
      id: '3',
      name: 'Priya Sharma',
      phone: '+91 98765 43212',
      role: 'Project Manager',
      avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=0f766e&color=fff',
      lastMessage: 'Location tag sent.',
      time: '10:35 AM',
      unreadCount: 1,
      messages: [
        { id: '1', sender: 'them', content: 'Did you review the weekly safety logs?', timestamp: '10:15 AM', read: true, viaWhatsApp: false },
        { id: '2', sender: 'me', content: 'Yes, looking through them now. They look mostly clear.', timestamp: '10:20 AM', read: true, viaWhatsApp: false },
        {
          id: '3',
          sender: 'them',
          content: 'Here is the current excavation location coordinates. Check the boundary limits.',
          timestamp: '10:30 AM',
          read: true,
          viaWhatsApp: false,
          mediaType: 'location',
          mediaUrl: 'https://maps.google.com/?q=12.9716,80.1994',
          mediaMeta: 'Site A - Chainage KM 12.5 (12.9716° N, 80.1994° E)',
        },
        { id: '4', sender: 'me', content: 'Got it, heading there now.', timestamp: '10:35 AM', read: true, viaWhatsApp: true },
      ],
    },
    {
      id: '4',
      name: 'Amit Singh',
      phone: '+91 98765 43213',
      role: 'Safety Manager',
      avatar: 'https://ui-avatars.com/api/?name=Amit+Singh&background=d97706&color=fff',
      lastMessage: 'Please review the voice memo safety report.',
      time: '09:12 AM',
      unreadCount: 0,
      messages: [
        { id: '1', sender: 'them', content: 'We had a minor PPE breach alert near the north boundary.', timestamp: '09:00 AM', read: true, viaWhatsApp: false },
        {
          id: '2',
          sender: 'them',
          content: 'Here is the safety audit voice recording from Site A.',
          timestamp: '09:05 AM',
          read: true,
          viaWhatsApp: true,
          mediaType: 'voice',
          mediaUrl: '#',
          mediaMeta: 'Safety Report: Crane Clearance - 0:42',
        },
        { id: '3', sender: 'me', content: 'I am reviewing the audio memo safety report now.', timestamp: '09:12 AM', read: true, viaWhatsApp: true },
      ],
    },
    {
      id: '5',
      name: 'Suresh Reddy',
      phone: '+91 98765 43214',
      role: 'Site Supervisor',
      avatar: 'https://ui-avatars.com/api/?name=Suresh+Reddy&background=0891b2&color=fff',
      lastMessage: 'Site progress photo uploaded.',
      time: 'Yesterday',
      unreadCount: 0,
      messages: [
        { id: '1', sender: 'them', content: 'The shift B workers have completed their induction.', timestamp: 'Yesterday', read: true, viaWhatsApp: false },
        {
          id: '2',
          sender: 'them',
          content: 'Foundation concrete pouring progress photo.',
          timestamp: 'Yesterday',
          read: true,
          viaWhatsApp: false,
          mediaType: 'image',
          mediaUrl: 'https://picsum.photos/seed/construction/400/250',
          mediaMeta: 'Foundation Block A2.jpg',
        },
        { id: '3', sender: 'me', content: 'Excellent, log it in the daily safety reports.', timestamp: 'Yesterday', read: true, viaWhatsApp: false },
      ],
    },
  ]);

  const [activeContactId, setActiveContactId] = useState<string>('3');
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [waConnected, setWaConnected] = useState<boolean>(false);
  const [waPhoneNumber, setWaPhoneNumber] = useState<string>('');
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [showWaModal, setShowWaModal] = useState<boolean>(false);
  const [sendViaWA, setSendViaWA] = useState<boolean>(false);
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);

  const activeContact = contacts.find((c) => c.id === activeContactId);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeContact?.messages]);

  // Connect mock WhatsApp
  const handleLinkWhatsApp = () => {
    setIsLinking(true);
    setTimeout(() => {
      setWaConnected(true);
      setWaPhoneNumber('+91 90000 12345');
      setIsLinking(false);
      setShowWaModal(false);
      setSendViaWA(true);
    }, 2000);
  };

  // Send message
  const handleSendMessage = (customMsg?: Partial<MessageBubble>) => {
    const text = customMsg?.content || typedMessage;
    if (!text.trim() && !customMsg?.mediaType) return;

    const newMsg: MessageBubble = {
      id: Date.now().toString(),
      sender: 'me',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      viaWhatsApp: sendViaWA && waConnected,
      ...customMsg,
    };

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            lastMessage: customMsg?.mediaType ? `Sent a ${customMsg.mediaType}` : text,
            time: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setTypedMessage('');
    setShowAttachMenu(false);

    // Trigger mock response
    setTimeout(() => {
      const reply: MessageBubble = {
        id: (Date.now() + 1).toString(),
        sender: 'them',
        content: customMsg?.mediaType
          ? `Acknowledge: Received the shared ${customMsg.mediaType} update. Processing now.`
          : `Acknowledge: "${text.slice(0, 15)}...". Copy that.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
        viaWhatsApp: sendViaWA && waConnected,
      };

      setContacts((prev) =>
        prev.map((c) => {
          if (c.id === activeContactId) {
            return {
              ...c,
              lastMessage: reply.content,
              time: 'Just now',
              messages: [...c.messages, reply],
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  // Attachment triggers
  const sendMockPhoto = () => {
    handleSendMessage({
      content: 'Inspection site photo shared.',
      mediaType: 'image',
      mediaUrl: 'https://picsum.photos/seed/pouring/400/250',
      mediaMeta: 'Crane Setup Clearance.jpg',
    });
  };

  const sendMockVoice = () => {
    handleSendMessage({
      content: 'Voice message reporting site checklist.',
      mediaType: 'voice',
      mediaMeta: 'Voice Note - 0:18',
    });
  };

  const sendMockLocation = () => {
    handleSendMessage({
      content: 'Current chainage location update.',
      mediaType: 'location',
      mediaUrl: 'https://maps.google.com/?q=13.0012,80.2015',
      mediaMeta: 'Site B - Chainage KM 18.2 (13.0012° N, 80.2015° E)',
    });
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-3 d-flex flex-column" style={{ height: 'calc(100vh - 90px)', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .whatsapp-chat-shell {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--bs-border-color);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        .whatsapp-left-panel {
          border-right: 1px solid var(--bs-border-color);
          background-color: var(--bs-body-bg);
        }
        .whatsapp-right-panel {
          background-color: var(--bs-tertiary-bg);
          position: relative;
        }
        .whatsapp-chat-header {
          background-color: var(--bs-secondary-bg);
          border-bottom: 1px solid var(--bs-border-color);
        }
        .whatsapp-chat-body {
          background-image: radial-gradient(var(--bs-border-color) 0.8px, transparent 0.8px);
          background-size: 16px 16px;
          background-color: var(--bs-tertiary-bg);
        }
        .msg-bubble {
          max-width: 65%;
          padding: 8px 12px;
          border-radius: 8px;
          position: relative;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .msg-bubble.sent {
          align-self: flex-end;
          background-color: #d9fdd3;
          color: #111b21;
        }
        html[data-theme="dark"] .msg-bubble.sent {
          background-color: #005c4b;
          color: #e9edef;
        }
        .msg-bubble.received {
          align-self: flex-start;
          background-color: var(--bs-body-bg);
          color: var(--bs-body-color);
          border: 1px solid var(--bs-border-color-translucent);
        }
        .contact-item {
          transition: all 0.15s ease;
          border-bottom: 1px solid var(--bs-border-color-translucent);
        }
        .contact-item:hover {
          background-color: var(--bs-secondary-bg);
          cursor: pointer;
        }
        .contact-item.active {
          background-color: var(--bs-primary-bg-subtle);
        }
        .whatsapp-check-icon {
          color: #53bdeb;
          font-size: 0.85rem;
        }
        .wa-indicator-pill {
          background-color: #25d366;
          color: #fff;
          font-size: 0.72rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
        }
        .pulse-light-green {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #25d366;
          box-shadow: 0 0 8px #25d366;
        }
        
        /* Media Attachments styling */
        .chat-media-image {
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 6px;
          max-width: 100%;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .chat-media-voice {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,0,0,0.05);
          padding: 8px;
          border-radius: 6px;
          margin-bottom: 6px;
        }
        .chat-media-location {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0,0,0,0.05);
          padding: 8px;
          border-radius: 6px;
          margin-bottom: 6px;
        }
        .attachment-menu-popover {
          position: absolute;
          bottom: 75px;
          left: 15px;
          background: var(--bs-secondary-bg);
          border: 1px solid var(--bs-border-color);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          width: 200px;
        }
        .live-stream-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .live-stream-modal {
          background: var(--bs-body-bg);
          border: 1px solid var(--bs-border-color);
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          color: var(--bs-body-color);
        }
      `}} />

      {/* Header Banner */}
      <div className="page-heading align-items-center mb-3">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-whatsapp text-success" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Communication</p>
            <h1 className="h3 mb-0">Live Messages</h1>
          </div>
        </div>

        <div className="heading-actions">
          {waConnected ? (
            <div className="d-flex align-items-center gap-2 bg-success-subtle text-success px-3 py-1.5 rounded border border-success border-opacity-20">
              <span className="pulse-light-green" />
              <span className="small fw-bold">WhatsApp Linked: {waPhoneNumber}</span>
              <button className="btn btn-sm btn-link text-success p-0 ms-2" onClick={() => { setWaConnected(false); setWaPhoneNumber(''); }}>Disconnect</button>
            </div>
          ) : (
            <button className="btn btn-success btn-sm" onClick={() => setShowWaModal(true)}>
              <i className="bi bi-whatsapp me-1" />Link WhatsApp
            </button>
          )}
        </div>
      </div>

      <div className="row g-0 whatsapp-chat-shell flex-grow-1" style={{ height: '0', minHeight: '0' }}>
        {/* Contacts List Pane */}
        <div className="col-12 col-md-4 col-lg-3 d-flex flex-column h-100 whatsapp-left-panel">
          <div className="p-3 bg-secondary-subtle border-bottom">
            <input className="form-control form-control-sm" type="search" placeholder="Search chats..." />
          </div>

          <div className="flex-grow-1 overflow-auto">
            {contacts.map((c) => (
              <div
                key={c.id}
                className={`contact-item p-3 d-flex gap-3 align-items-center ${activeContactId === c.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveContactId(c.id);
                  setContacts(prev => prev.map(item => item.id === c.id ? { ...item, unreadCount: 0 } : item));
                }}
              >
                <img className="avatar-img avatar-md rounded-circle" src={c.avatar} alt={c.name} />
                <div className="flex-grow-1 min-width-0">
                  <div className="d-flex justify-content-between align-items-baseline mb-1">
                    <h6 className="fw-bold mb-0 text-truncate small">{c.name}</h6>
                    <small className="text-muted" style={{ fontSize: '0.65rem' }}>{c.time}</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="text-muted mb-0 small text-truncate" style={{ fontSize: '0.78rem' }}>{c.lastMessage}</p>
                    {c.unreadCount > 0 && (
                      <span className="badge bg-success rounded-pill small" style={{ fontSize: '0.65rem' }}>{c.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window Pane */}
        <div className="col-12 col-md-8 col-lg-9 d-flex flex-column h-100 whatsapp-right-panel">
          {activeContact ? (
            <>
              {/* Chat Window Header */}
              <div className="whatsapp-chat-header p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <img className="avatar-img avatar-md rounded-circle" src={activeContact.avatar} alt={activeContact.name} />
                  <div>
                    <h5 className="fw-bold mb-0 small">{activeContact.name}</h5>
                    <small className="text-muted">{activeContact.role} • {activeContact.phone}</small>
                  </div>
                </div>
                {waConnected && (
                  <div className="d-flex align-items-center gap-2">
                    <span className="wa-indicator-pill"><i className="bi bi-whatsapp me-1" />WhatsApp Active</span>
                  </div>
                )}
              </div>

              {/* Chat Messages Body */}
              <div className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-3 whatsapp-chat-body">
                {activeContact.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`msg-bubble d-flex flex-column ${m.sender === 'me' ? 'sent' : 'received'}`}
                  >
                    {/* Render Image Attachments */}
                    {m.mediaType === 'image' && m.mediaUrl && (
                      <div className="chat-media-image">
                        <img src={m.mediaUrl} alt="blueprints attachment" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        <div className="p-2 bg-dark bg-opacity-10 text-body-emphasis small d-flex align-items-center justify-content-between">
                          <span className="text-truncate" style={{ maxWidth: '80%' }}>{m.mediaMeta}</span>
                          <button className="btn btn-sm btn-link p-0 text-decoration-none"><i className="bi bi-download" /></button>
                        </div>
                      </div>
                    )}

                    {/* Render Voice Message Audio */}
                    {m.mediaType === 'voice' && (
                      <div className="chat-media-voice text-body-emphasis">
                        <span className="fs-5"><i className="bi bi-play-circle-fill text-success" /></span>
                        <div className="flex-grow-1">
                          <div className="progress mb-1" style={{ height: '4px', width: '100px' }}>
                            <div className="progress-bar bg-success" style={{ width: '35%' }} />
                          </div>
                          <span className="small text-muted" style={{ fontSize: '0.65rem' }}>{m.mediaMeta}</span>
                        </div>
                        <span className="fs-6 text-muted"><i className="bi bi-mic" /></span>
                      </div>
                    )}

                    {/* Render Location Tag Coordinates */}
                    {m.mediaType === 'location' && m.mediaUrl && (
                      <div className="chat-media-location text-body-emphasis">
                        <span className="fs-4 text-danger"><i className="bi bi-geo-alt-fill" /></span>
                        <div className="flex-grow-1">
                          <strong className="d-block small text-truncate" style={{ maxWidth: '160px' }}>Shared Location</strong>
                          <span className="text-muted small d-block text-truncate" style={{ fontSize: '0.65rem', maxWidth: '160px' }}>{m.mediaMeta}</span>
                          <a href={m.mediaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-primary py-0.5 px-2 mt-1 small" style={{ fontSize: '0.65rem' }}>
                            <i className="bi bi-map me-1" />Open Map
                          </a>
                        </div>
                      </div>
                    )}

                    <p className="mb-1 small" style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>
                    <div className="d-flex align-items-center justify-content-end gap-1.5 self-align-end" style={{ fontSize: '0.68rem', opacity: 0.7 }}>
                      <span className="font-monospace">{m.timestamp}</span>
                      {m.viaWhatsApp && <span className="text-success small fw-bold"><i className="bi bi-whatsapp" /></span>}
                      {m.sender === 'me' && (
                        <i className="bi bi-check-all whatsapp-check-icon" />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Footer */}
              <div className="p-3 bg-secondary-subtle border-top position-relative">
                {/* Attachments Dropdown Menu */}
                {showAttachMenu && (
                  <div className="attachment-menu-popover p-2">
                    <button className="dropdown-item p-2 d-flex align-items-center gap-2 rounded text-body-emphasis small" onClick={sendMockPhoto}>
                      <i className="bi bi-image text-primary" />
                      <span>📷 Share Site Photo</span>
                    </button>
                    <button className="dropdown-item p-2 d-flex align-items-center gap-2 rounded text-body-emphasis small mt-1" onClick={sendMockVoice}>
                      <i className="bi bi-mic text-success" />
                      <span>🎙️ Send Voice Memo</span>
                    </button>
                    <button className="dropdown-item p-2 d-flex align-items-center gap-2 rounded text-body-emphasis small mt-1" onClick={sendMockLocation}>
                      <i className="bi bi-geo-alt text-danger" />
                      <span>📍 Send GPS Location</span>
                    </button>
                  </div>
                )}

                <div className="d-flex align-items-center gap-2">
                  {/* Paperclip attachment trigger */}
                  <button
                    className="btn btn-outline-secondary rounded-circle"
                    style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                  >
                    <i className="bi bi-paperclip" />
                  </button>

                  {/* WhatsApp Bridge toggle option */}
                  {waConnected && (
                    <div className="form-check form-switch mb-0 me-2">
                      <input
                        className="form-check-input bg-success border-success"
                        type="checkbox"
                        id="waSwitch"
                        checked={sendViaWA}
                        onChange={(e) => setSendViaWA(e.target.checked)}
                      />
                      <label className="form-check-label small text-success fw-bold" htmlFor="waSwitch">
                        <i className="bi bi-whatsapp me-1" />WA Bridge
                      </label>
                    </div>
                  )}

                  <input
                    className="form-control"
                    type="text"
                    placeholder="Type a message..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="btn btn-primary" onClick={() => handleSendMessage()}>
                    <i className="bi bi-send" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-100 d-flex align-items-center justify-content-center text-center text-muted">
              <div>
                <i className="bi bi-chat-dots-fill fs-1 mb-2 d-block" />
                <h5 className="fw-bold">Select Contact Chat</h5>
                <p className="small">Choose a user from the list to begin platform communications.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Link QR Code Modal */}
      {showWaModal && (
        <div className="live-stream-overlay">
          <div className="live-stream-modal p-4" style={{ maxWidth: '500px' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-3">
              <h5 className="fw-bold mb-0 text-success d-flex align-items-center gap-2">
                <i className="bi bi-whatsapp" />
                <span>Link WhatsApp API Portal</span>
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowWaModal(false)} />
            </div>

            <div className="text-center py-3">
              <div
                className="bg-white p-3 mx-auto mb-3 d-flex flex-column align-items-center justify-content-center border"
                style={{ width: '220px', height: '220px', borderRadius: '8px' }}
              >
                <svg width="180" height="180" viewBox="0 0 29 29" style={{ shapeRendering: 'crispEdges' }}>
                  <rect width="29" height="29" fill="white" />
                  <path
                    fill="#111b21"
                    d="M0,0 h7 v7 h-7 z M0,22 h7 v7 h-7 z M22,0 h7 v7 h-7 z
                       M1,1 h5 v5 h-5 z M1,23 h5 v5 h-5 z M23,1 h5 v5 h-5 z
                       M3,3 h1 v1 h-1 z M3,25 h1 v1 h-1 z M25,3 h1 v1 h-1 z
                       M9,0 h2 v1 h-2 z M13,0 h3 v1 h-3 z M18,0 h2 v1 h-2 z
                       M8,2 h1 v3 h-1 z M10,2 h3 v1 h-3 z M14,2 h2 v2 h-2 z
                       M18,2 h1 v1 h-1 z M20,2 h1 v3 h-1 z
                       M9,4 h2 v1 h-2 z M12,4 h1 v3 h-1 z M15,4 h3 v1 h-3 z
                       M8,6 h2 v1 h-2 z M11,6 h1 v1 h-1 z M14,6 h2 v1 h-2 z M18,6 h3 v1 h-3 z
                       M0,9 h1 v2 h-1 z M2,9 h4 v1 h-4 z M7,9 h2 v1 h-2 z M10,9 h3 v2 h-3 z M14,9 h1 v1 h-1 z M16,9 h3 v1 h-3 z M21,9 h2 v1 h-2 z M24,9 h4 v2 h-4 z
                       M0,12 h3 v1 h-3 z M4,12 h1 v2 h-1 z M7,12 h3 v1 h-3 z M11,12 h1 v1 h-1 z M13,12 h2 v2 h-2 z M16,12 h2 v1 h-2 z M19,12 h4 v1 h-4 z M25,12 h2 v2 h-2 z
                       M2,14 h2 v1 h-2 z M5,14 h1 v1 h-1 z M8,14 h1 v2 h-1 z M10,14 h2 v1 h-2 z M15,14 h3 v1 h-3 z M20,14 h2 v1 h-2 z M23,14 h1 v1 h-1 z M27,14 h2 v1 h-2 z
                       M0,16 h2 v1 h-2 z M3,16 h3 v2 h-3 z M7,16 h1 v1 h-1 z M9,16 h1 v1 h-1 z M11,16 h3 v1 h-3 z M16,16 h2 v1 h-2 z M19,16 h1 v1 h-1 z M22,16 h3 v1 h-3 z M26,16 h2 v2 h-2 z
                       M1,18 h2 v1 h-2 z M4,18 h1 v1 h-1 z M7,18 h2 v2 h-2 z M10,18 h1 v1 h-1 z M13,18 h2 v1 h-2 z M17,18 h1 v1 h-1 z M19,18 h2 v1 h-2 z M23,18 h1 v1 h-1 z M25,18 h3 v1 h-3 z
                       M0,20 h3 v1 h-3 z M5,20 h1 v1 h-1 z M8,20 h2 v1 h-2 z M11,20 h1 v1 h-1 z M14,20 h2 v1 h-2 z M18,20 h2 v1 h-2 z M21,20 h3 v1 h-3 z M26,20 h1 v1 h-1 z
                       M9,22 h2 v2 h-2 z M12,22 h3 v1 h-3 z M16,22 h2 v1 h-2 z M19,22 h1 v1 h-1 z M21,22 h3 v1 h-3 z M25,22 h2 v1 h-2 z
                       M8,24 h1 v3 h-1 z M10,24 h3 v1 h-3 z M15,24 h1 v1 h-1 z M18,24 h2 v1 h-2 z M22,24 h1 v2 h-1 z M24,24 h3 v1 h-3 z
                       M9,26 h2 v1 h-2 z M12,26 h1 v2 h-1 z M14,26 h3 v1 h-3 z M19,26 h1 v1 h-1 z M21,26 h2 v1 h-2 z M25,26 h3 v1 h-3 z
                       M8,28 h3 v1 h-3 z M13,28 h2 v1 h-3 z M16,28 h2 v1 h-2 z M19,28 h3 v1 h-3 z M23,28 h2 v1 h-2 z M27,28 h2 v1 h-2 z"
                  />
                </svg>
              </div>

              <ol className="text-start small text-muted d-grid gap-1 px-3 mb-4">
                <li>Open WhatsApp on your mobile phone device.</li>
                <li>Tap **Menu** (or **Settings**) and select **Linked Devices**.</li>
                <li>Tap **Link a Device** and capture the screen QR code.</li>
              </ol>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-success flex-grow-1"
                  onClick={handleLinkWhatsApp}
                  disabled={isLinking}
                >
                  {isLinking ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Linking Gateway...
                    </>
                  ) : (
                    'Scan & Link Profile'
                  )}
                </button>
                <button className="btn btn-outline-secondary" onClick={() => setShowWaModal(false)} disabled={isLinking}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};