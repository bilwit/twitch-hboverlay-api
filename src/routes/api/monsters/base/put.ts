import { Router } from 'express';
import upload, { deleteAvatar } from '../../../../utils/storage';
import { UpdatedMonsterData } from './monsters.interface';

module.exports = Router({ mergeParams: true }).put('/monsters/base/:id', upload.single('avatarFile'), async (req: any, res: any) => {
  try {
    let deleteOldAvatarPath = '';

    const CheckAvatar = await req.db.monster.findFirst({
      where: {
        id: Number(req.params.id),
      },
      select: {
        avatar_url: true,
        published: true,
      }
    });

    // delete existing avatar if request indicated change
    if (JSON.parse(req.body.isAvatarChanged)) {
      if (CheckAvatar?.avatar_url) {
        deleteOldAvatarPath = CheckAvatar?.avatar_url;
      }
    }

    const updatedData: UpdatedMonsterData = {
      name: JSON.parse(req.body.name),
      published: JSON.parse(req.body.published),
      hp_multiplier: JSON.parse(req.body.hp_multiplier),
      hp_style: JSON.parse(req.body.hp_style),
      bar_theme: JSON.parse(req.body.bar_theme).toLowerCase(),
      trigger_words: Array.isArray(JSON.parse(req.body.trigger_words)) && JSON.parse(req.body.trigger_words).length > 0 ? JSON.parse(req.body.trigger_words).join(',') : '',
    }

    if (JSON.parse(req.body.isAvatarChanged)) {
      updatedData['avatar_url'] = req?.file?.filename || undefined;
    }

    const monster = await req.db.monster.update({
      where: {
        id: Number(req.params.id),
      },
      data: updatedData,
    });
  
    if (monster && monster?.id > 0) {

      // **************************** MOVE TO CLIENT ****************************
      // if (CheckAvatar.published !== JSON.parse(req.body.published)) {
      //   // update Twitch service watched monster list in case of publish status change
      //   req['TwitchEmitter'].emit('publish', {
      //     id: monster.id,
      //     status: JSON.parse(req.body.published),
      //   });
      // } else if (JSON.parse(req.body.published)){
      //   // re-initialize watched monster to update multiplier/theme/triggers
      //   req['TwitchEmitter'].emit('publish', {
      //     id: monster.id,
      //     status: false,
      //   });
      //   req['TwitchEmitter'].emit('publish', {
      //     id: monster.id,
      //     status: true,
      //   });
      // }

      if (deleteOldAvatarPath) {
        try {
          const isDeleted = await deleteAvatar(deleteOldAvatarPath);
          if (isDeleted) {
            console.log(isDeleted?.msg);
          }
        } catch (e) {
          console.error('Could not delete old avatar');
        }
      }

      return res.status(200).json({
        success: true,
        data: [monster],
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