import trainerService from "../services/trainerService.js"

export async function getTrainerProfile (req, res) {
     try {
          const { id } = req.params
          const profile = trainerService.getTrainerProfile(id)
          res.status(200).json({
               success: true,
               data: { profile },
          });
     } catch (error) {
          res.status(404).json({
               success: false,
               message: error.message,
          });
     }
}
