import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Adiciona o ID do usuário à requisição
    next(); // Prossegue para a próxima função
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};