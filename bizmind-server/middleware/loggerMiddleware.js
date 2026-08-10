export const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number((process.hrtime.bigint() - start) / 1000000n);
    const timestamp = new Date().toISOString();
    const userId = req.user?._id || req.user?.id || 'anonymous';
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms) user=${userId}`
    );
  });

  next();
};