import { Router } from 'express';
import upload, { deleteAvatar } from '../../../../utils/storage';
import { UpdatedStageData } from './stages';

module.exports = Router({ mergeParams: true }).put('/monsters/stages/:id', upload.single('avatarFile'), async (req: any, res: any) => {
  try {

    let deleteOldAvatarPath = '';
    // delete existing avatar if request indicated change
    if (JSON.parse(req.body.isAvatarChanged)) {
      const CheckAvatar = await req.db.stages.findFirst({
        where: {
          id: Number(req.params.id),
        },
        select: {
          avatar_url: true,
        }
      });
      if (CheckAvatar?.avatar_url) {
        deleteOldAvatarPath = CheckAvatar?.avatar_url;
      }
    }

    const updatedData: UpdatedStageData = {
      hp_value: JSON.parse(req.body.hp_value),
      ref_id: JSON.parse(req.body.ref_id),
      pause_init: JSON.parse(req.body.pause_init) === true,
    }

    if (JSON.parse(req.body.isAvatarChanged)) {
      updatedData['avatar_url'] = req?.file?.filename || undefined;
    }

    const stage = await req.db.stages.update({
      where: {
        id: Number(req.params.id),
      },
      data: updatedData,
    });
  
    if (stage && stage?.id > 0) {

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
        data: [stage],
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