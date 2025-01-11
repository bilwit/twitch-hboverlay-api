import { Router } from 'express';

module.exports = Router({ mergeParams: true }).put('/settings', async (req: any, res: any) => {
  try {
    const settings = await req.db.settings.upsert({
      where: {
        id: 1,
      },
      update: {
        listener_auth_code: req.body.listener_auth_code,
        listener_client_id: req.body.listener_client_id,
        listener_secret: req.body.listener_secret,
        listener_user_name: req.body.listener_user_name,
        channel_name: req.body.channel_name,
        redirect_uri: req.body.redirect_uri,
        is_connected: true,
      },
      create: {
        listener_auth_code: req.body.listener_auth_code,
        listener_client_id: req.body.listener_client_id,
        listener_secret: req.body.listener_secret,
        listener_user_name: req.body.listener_user_name,
        channel_name: req.body.channel_name,
        redirect_uri: req.body.redirect_uri,
        is_connected: true,
      },
    });
  
    if (settings && settings?.id > 0) {

      // **************************** MOVE TO CLIENT ****************************
      // req['TwitchEmitterConnection'].disconnect();
      // req['TwitchEmitterConnection'].connect();

      return res.status(200).json({
        success: true,
        data: settings,
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
