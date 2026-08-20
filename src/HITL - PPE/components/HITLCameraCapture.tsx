/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DIRECTION_LABELS = [
  'NORTH',
  'NORTH EAST',
  'EAST',
  'SOUTH EAST',
  'SOUTH',
  'SOUTH WEST',
  'WEST',
  'NORTH WEST',
];

function normalizeHeading(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function shortestAngleDelta(fromHeading: number, toHeading: number): number {
  const delta = normalizeHeading(toHeading - fromHeading);
  return delta > 180 ? delta - 360 : delta;
}

function smoothHeading(currentHeading: number, nextHeading: number, smoothing = 0.25): number {
  const delta = shortestAngleDelta(currentHeading, nextHeading);
  return normalizeHeading(currentHeading + delta * smoothing);
}

function getScreenOrientationAngle(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const rawAngle =
    (typeof window.screen?.orientation?.angle === 'number' && window.screen.orientation.angle) ||
    (typeof (window as any).orientation === 'number' && (window as any).orientation) ||
    0;

  return normalizeHeading(rawAngle);
}

function headingToDirection(headingDegrees: number): string {
  const normalized = normalizeHeading(headingDegrees);

  if (normalized >= 337.5 || normalized < 22.5) return DIRECTION_LABELS[0];
  if (normalized < 67.5) return DIRECTION_LABELS[1];
  if (normalized < 112.5) return DIRECTION_LABELS[2];
  if (normalized < 157.5) return DIRECTION_LABELS[3];
  if (normalized < 202.5) return DIRECTION_LABELS[4];
  if (normalized < 247.5) return DIRECTION_LABELS[5];
  if (normalized < 292.5) return DIRECTION_LABELS[6];
  return DIRECTION_LABELS[7];
}

function getHeadingFromEvent(event: DeviceOrientationEvent): number | null {
  if (typeof (event as any).webkitCompassHeading === 'number' && Number.isFinite((event as any).webkitCompassHeading)) {
    return normalizeHeading((event as any).webkitCompassHeading);
  }

  if (event.absolute !== true) {
    return null;
  }

  if (typeof event.alpha === 'number' && Number.isFinite(event.alpha)) {
    // DeviceOrientation alpha is relative to the device frame. Compensate for
    // screen rotation so heading matches what user sees in portrait/landscape.
    const orientationAngle = getScreenOrientationAngle();
    return normalizeHeading(360 - event.alpha + orientationAngle);
  }

  return null;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load captured frame.'));
    image.src = dataUrl;
  });
}

function getCurrentCoordinates(): Promise<{ lat: string; lon: string }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation unsupported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude.toFixed(6),
          lon: position.coords.longitude.toFixed(6),
        });
      },
      () => reject(new Error('Location denied or unavailable')),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
      }
    );
  });
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function formatCaptureTimestamp(timestamp: Date): string {
  const datePart = timestamp.toLocaleDateString('en-GB');
  const timePart = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${datePart}, ${timePart}`;
}

interface HITLCameraCaptureProps {
  isOpen: boolean;
  isDark?: boolean;
  siteName?: string;
  currentCount?: number;
  maxCaptures?: number;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  onError?: (msg: string) => void;
}

function HITLCameraCapture({
  isOpen,
  isDark = false,
  siteName = '',
  currentCount = 0,
  maxCaptures = 4,
  onClose,
  onCapture,
  onError,
}: HITLCameraCaptureProps) {
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [heading, setHeading] = useState(0);
  const [direction, setDirection] = useState('NORTH');
  const [cameraError, setCameraError] = useState('');
  const [orientationError, setOrientationError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const videoConstraints = useMemo(
    () => ({
      facingMode: { ideal: 'environment' },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    }),
    []
  );

  const isLimitReached = currentCount >= maxCaptures;

  const stopCameraStream = useCallback(() => {
    const video = webcamRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      if (stream && typeof stream.getTracks === 'function') {
        stream.getTracks().forEach((track) => track.stop());
      }
      video.srcObject = null;
    }
  }, []);

  // Request/start camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      return undefined;
    }

    let mounted = true;
    let activeStream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: videoConstraints,
      })
      .then((stream) => {
        if (mounted && webcamRef.current) {
          webcamRef.current.srcObject = stream;
          activeStream = stream;
          setCameraError('');
        }
      })
      .catch((err) => {
        console.error('Camera streaming setup failed:', err);
        if (mounted) {
          const message = 'Camera permission denied or camera unavailable.';
          setCameraError(message);
          if (onError) {
            onError(message);
          }
        }
      });

    return () => {
      mounted = false;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      stopCameraStream();
    };
  }, [isOpen, videoConstraints, stopCameraStream, onError]);

  // Handle device orientation
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let mounted = true;

    const setupOrientation = async () => {
      if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
        if (mounted) {
          setOrientationError('Direction sensor is unsupported on this browser.');
        }
        return;
      }

      if (typeof (window.DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (window.DeviceOrientationEvent as any).requestPermission();
          if (permission !== 'granted') {
            if (mounted) {
              setOrientationError('Orientation permission denied. Showing default direction.');
            }
            return;
          }
        } catch {
          if (mounted) {
            setOrientationError('Unable to access orientation sensor. Showing default direction.');
          }
          return;
        }
      }

      const handleOrientation = (event: DeviceOrientationEvent) => {
        const nextHeading = getHeadingFromEvent(event);
        if (nextHeading === null) {
          return;
        }

        setOrientationError('');

        setHeading((current) => {
          const smoothed = smoothHeading(current, nextHeading);
          const nextDirection = headingToDirection(smoothed);
          setDirection((previousDirection) => (previousDirection === nextDirection ? previousDirection : nextDirection));
          return smoothed;
        });
      };

      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);

      if (!mounted) {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }

      return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };
    };

    let cleanupOrientation: (() => void) | null = null;
    setupOrientation().then((cleanup) => {
      if (cleanup) {
        cleanupOrientation = cleanup;
      }
    });

    return () => {
      mounted = false;
      if (typeof cleanupOrientation === 'function') {
        (cleanupOrientation as () => void)();
      }
    };
  }, [isOpen]);

  const buildStampedImage = useCallback(
    async (sourceDataUrl: string) => {
      const image = await loadImage(sourceDataUrl);
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas unavailable.');
      }

      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context unavailable.');
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      const directionText = `${direction} (${Math.round(heading)}°)`;
      const captureTimestamp = new Date();
      const topLeftText = [siteName, formatCaptureTimestamp(captureTimestamp)].filter(Boolean).join(', ');

      // Mandatory GPS location retrieval upon capture
      const gpsText = await getCurrentCoordinates()
        .then((coords) => `GPS ${coords.lat}, ${coords.lon}`)
        .catch(() => 'GPS location unavailable');

      const directionFontSize = Math.max(22, Math.round(width * 0.035));
      const gpsFontSize = Math.max(14, Math.round(directionFontSize * 0.62));
      const lineGap = Math.max(4, Math.round(height * 0.006));
      const paddingX = Math.max(16, Math.round(width * 0.02));
      const paddingY = Math.max(12, Math.round(height * 0.02));

      ctx.font = `bold ${directionFontSize}px Arial, sans-serif`;
      const directionTextWidth = ctx.measureText(directionText).width;

      ctx.font = `500 ${gpsFontSize}px Arial, sans-serif`;
      const gpsTextWidth = ctx.measureText(gpsText).width;

      const textWidth = Math.max(directionTextWidth, gpsTextWidth);
      const boxWidth = textWidth + paddingX * 2;
      const gpsBlockHeight = gpsFontSize + lineGap;
      const boxHeight = directionFontSize + gpsBlockHeight + paddingY * 2;
      const boxX = Math.max(20, (width - boxWidth) / 2);
      const boxY = Math.max(20, Math.round(height * 0.05));

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 14);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'top';
      ctx.font = `bold ${directionFontSize}px Arial, sans-serif`;
      ctx.fillText(directionText, boxX + paddingX, boxY + paddingY);

      ctx.font = `500 ${gpsFontSize}px Arial, sans-serif`;
      ctx.fillText(gpsText, boxX + paddingX, boxY + paddingY + directionFontSize + lineGap);

      if (topLeftText) {
        const topLeftFontSize = Math.max(12, Math.round(width * 0.018));
        const topLeftLinePaddingX = Math.max(8, Math.round(width * 0.012));
        const topLeftLinePaddingY = Math.max(6, Math.round(height * 0.01));
        const topLeftMargin = Math.max(10, Math.round(width * 0.012));

        ctx.font = `500 ${topLeftFontSize}px Arial, sans-serif`;
        const topLeftTextWidth = ctx.measureText(topLeftText).width;
        const topLeftBoxWidth = topLeftTextWidth + topLeftLinePaddingX * 2;
        const topLeftBoxHeight = topLeftFontSize + topLeftLinePaddingY * 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        drawRoundedRect(ctx, topLeftMargin, topLeftMargin, topLeftBoxWidth, topLeftBoxHeight, 8);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'top';
        ctx.fillText(topLeftText, topLeftMargin + topLeftLinePaddingX, topLeftMargin + topLeftLinePaddingY);
      }

      return canvas.toDataURL('image/jpeg', 0.95);
    },
    [direction, heading, siteName]
  );

  const handleCapture = useCallback(async () => {
    if (isCapturing || isLimitReached) {
      if (isLimitReached && onError) {
        onError(`Maximum ${maxCaptures} photos allowed`);
      }
      return;
    }

    const video = webcamRef.current;
    if (!video || video.readyState < 2) {
      const message = 'Unable to capture frame. Camera stream not ready.';
      setCameraError(message);
      if (onError) {
        onError(message);
      }
      return;
    }

    setIsCapturing(true);
    setCameraError('');

    try {
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = video.videoWidth || 1280;
      captureCanvas.height = video.videoHeight || 720;
      const captureCtx = captureCanvas.getContext('2d');
      if (!captureCtx) {
        throw new Error('Canvas context failed');
      }

      captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
      const frame = captureCanvas.toDataURL('image/jpeg', 0.95);

      const finalImage = await buildStampedImage(frame);
      onCapture(finalImage);
      stopCameraStream();
      onClose();
    } catch (err) {
      console.error('Camera capture processing failed:', err);
      const message = 'Capture failed. Please try again.';
      setCameraError(message);
      if (onError) {
        onError(message);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [buildStampedImage, isCapturing, isLimitReached, maxCaptures, onCapture, onClose, onError, stopCameraStream]);

  const handleFallbackPick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFallbackFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isLimitReached) {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (onError) {
          onError(`Maximum ${maxCaptures} photos allowed`);
        }
        return;
      }

      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        if (!dataUrl) {
          return;
        }

        setIsCapturing(true);
        setCameraError('');

        try {
          const finalImage = await buildStampedImage(dataUrl);
          onCapture(finalImage);
          onClose();
        } catch {
          const message = 'Capture failed. Please try again.';
          setCameraError(message);
          if (onError) {
            onError(message);
          }
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setIsCapturing(false);
        }
      };

      reader.onerror = () => {
        const message = 'Unable to read selected image.';
        setCameraError(message);
        if (onError) {
          onError(message);
        }
      };

      reader.readAsDataURL(file);
    },
    [buildStampedImage, isLimitReached, maxCaptures, onCapture, onClose, onError]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-black d-flex flex-column"
      style={{ zIndex: 1100 }}
    >
      <div
        className="position-absolute start-0 end-0 top-0 pointer-events-none"
        style={{
          height: '160px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
          zIndex: 1110,
        }}
      />

      <button
        type="button"
        onClick={() => {
          stopCameraStream();
          onClose();
        }}
        className="position-absolute top-0 end-0 m-3 btn btn-dark btn-sm rounded-circle d-flex align-items-center justify-content-center p-2"
        style={{ zIndex: 1120, width: '38px', height: '38px', opacity: 0.8 }}
        aria-label="Close camera"
      >
        <i className="bi bi-x-lg text-white fs-5" aria-hidden="true" />
      </button>

      <div className="position-relative flex-grow-1 w-100 h-100 overflow-hidden d-flex align-items-center justify-content-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFallbackFileChange}
          className="d-none"
        />

        <video
          ref={webcamRef}
          autoPlay
          playsInline
          muted
          className="w-100 h-100"
          style={{ objectFit: 'cover' }}
        />

        <div
          className="position-absolute start-50 translate-middle-x rounded-3 px-4 py-2 text-center text-white fw-bold shadow-sm"
          style={{
            top: '24px',
            zIndex: 1120,
            fontSize: '1.5rem',
            letterSpacing: '0.05em',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {direction} ({Math.round(heading)}°)
        </div>

        {(cameraError || orientationError) && (
          <div
            className="position-absolute start-0 end-0 px-3 d-flex flex-column gap-2"
            style={{ top: '85px', zIndex: 1120 }}
          >
            {cameraError && (
              <div className="alert alert-danger border-danger shadow-sm py-2 px-3 m-0" role="alert">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <span className="small fw-semibold text-danger">{cameraError}</span>
                  <button
                    type="button"
                    onClick={handleFallbackPick}
                    className="btn btn-outline-danger btn-sm fw-bold px-3"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Use Phone Camera
                  </button>
                </div>
              </div>
            )}
            {orientationError && (
              <div className="alert alert-warning border-warning shadow-sm py-2 px-3 m-0" role="alert">
                <span className="small fw-semibold text-warning-dark">{orientationError}</span>
              </div>
            )}
          </div>
        )}

        <div
          className="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex flex-column flex-sm-row gap-3 align-items-center w-100 px-3 text-center justify-content-center"
          style={{ zIndex: 1120, maxWidth: '450px' }}
        >
          <div
            className={`rounded-pill px-4 py-2 small fw-semibold shadow-sm ${
              isDark ? 'bg-dark text-white bg-opacity-75' : 'bg-white text-dark bg-opacity-85'
            }`}
          >
            {currentCount}/{maxCaptures}
          </div>

          <button
            type="button"
            onClick={handleCapture}
            disabled={isCapturing || isLimitReached}
            className="btn btn-primary btn-lg rounded-pill px-5 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg w-100 w-sm-auto"
          >
            <i className="bi bi-camera-fill" aria-hidden="true" />
            {isCapturing ? 'Capturing...' : isLimitReached ? 'Limit Reached' : 'Capture'}
          </button>

          <div
            className={`rounded-pill px-4 py-2 small fw-semibold d-flex align-items-center justify-content-center shadow-sm ${
              isDark ? 'bg-dark text-white bg-opacity-75' : 'bg-white text-dark bg-opacity-85'
            }`}
          >
            <i className="bi bi-compass me-2" aria-hidden="true" />
            Live Heading
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="d-none" aria-hidden="true" />
    </div>
  );
}

export default HITLCameraCapture;
