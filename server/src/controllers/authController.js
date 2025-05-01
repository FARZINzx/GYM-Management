import authService from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const {token , role} = await authService.login(username, password);

    res.status(200).json({
      success: true,
      message: "ورود با موفقیت انجام شد",
      status: 200,
      data: { token , role },
    });
  } catch (error) {
    console.log(error);
    
    res.status(401).json({
      success: false,
      message: error.message,
      status: 401,
    });
  }
};

export const getSecurityQuestion = async (req, res) => {
  try {
    const { username } = req.params;
    const question = await authService.getSecurityQuestion(username);
    res.status(200).json({
      success: true,
      data:{question},
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifySecurityAnswer = async (req, res) => {
  try {
    const { username, answer } = req.body;
    const password = await authService.verifySecurityAnswer(username, answer);
    res.status(200).json({
      success: true,
      message: "پاسخ صحیح است",
      data:{password},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};