import app from '../server';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel API Invocation Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Lỗi máy chủ: ' + (err?.message || 'Unknown error'),
      });
    }
  }
}

