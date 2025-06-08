import authService from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { token, role, employee_id } = await authService.login(
      username,
      password,
    );

    res.status(200).json({
      success: true,
      message: "ورود با موفقیت انجام شد",
      status: 200,
      data: { token, role, employee_id },
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
      data: { question },
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
    const id = await authService.verifySecurityAnswer(username, answer);
    res.status(200).json({
      success: true,
      message: "پاسخ صحیح است",
      data: { id },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllSecurityQuestions = async (req, res, next) => {
  try {
    const result = await authService.getAllSecurityQuestions();

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      throw new Error("رمز عبور باید حداقل 8 کاراکتر باشد.");
    }

    const result = await authService.resetPassword(userId, newPassword);

    res.status(200).json({
      success: true,
      message: "رمز عبور با موفقیت تغییر یافت",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
