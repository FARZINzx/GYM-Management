import authService from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await authService.login(username, password);

    res.status(200).json({
      success: true,
      status: 200,
      data: { token },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
