// middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    res.status(err.status || 500).json({
      error: true,
      message: err.message || 'Erro interno do servidor',
    });
  };
  