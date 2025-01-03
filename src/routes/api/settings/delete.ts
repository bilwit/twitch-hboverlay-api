import { Router } from 'express';

module.exports = Router({ mergeParams: true }).delete('/settings', async (req: any, res: any) => {
  try {
    const settings = await req.db.settings.deleteMany({});
    
    req.db.refresh_token.delete({
      where: {
        id: 1,
      },
    });
  
    if (settings && settings.count > 0) {

      // **************************** MOVE TO CLIENT ****************************
      // req['TwitchEmitterConnection'].disconnect();

      return res.status(200).json({
        success: true,
      });
    } else {
      throw true;
    }
  } catch (e) {
    if (e !== true) {
      console.error(e);
    }
    return res.status(500).json({
      success: false,
    });
  }
});