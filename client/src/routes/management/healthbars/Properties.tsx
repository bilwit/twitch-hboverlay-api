
import { 
  Alert,
  Button,
  Card,
  Image,
  CopyButton,
  FileInput,
  Grid,
  Group,
  Space,
  TextInput,
  Text,
  Overlay,
} from '@mantine/core';
import classes from '../../../css/Nav.module.css';
import { MdBattery1Bar } from 'react-icons/md';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { theme } from '../../../theme';
import { BiInfoCircle } from 'react-icons/bi';
import { HealthBar } from '../useGetData';
import { BsLayoutSidebarInsetReverse } from 'react-icons/bs';
import { AiFillDelete } from 'react-icons/ai';
import Alerts from '../Alerts';

interface Props {
  isOpened: boolean,
  close: () => void,
  data?: HealthBar,
  setData: React.Dispatch<React.SetStateAction<HealthBar[]>>,
  setModalName: React.Dispatch<React.SetStateAction<string>>,
}

interface FormDataInterface {
  name: string;
  avatarFile: File | null;
}

function Properties(props: Props) {
  const CreateForm = useForm({
    initialValues: {
      name: props?.data?.name || '',
      avatarFile: null,
    },

    validate: {
      name: (value) => value ? null : 'Required',
      avatarFile: () => null,
    },
  });
  const [info, setInfo] = useState('');
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(props?.data?.id && (props?.data?.id !== null) ? true : false);
  const [isEditSuccess, setIsEditSuccess] = useState('');
  const [obsOverlayURL, setObsOverlayURL] = useState(props?.data?.id ? window.location.origin + '/display/' + props.data.id : '');
  const [avatar, setAvatar] = useState<string | ArrayBuffer | null>(null);
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);
  const [avatarFile, setAvatarFile] = useState<Blob | null>(null);
  const [isDeleteWarning, setIsDeleteWarning] = useState(false);

  return (
    <>
      <Alerts
        error={error}
        warning={warning}
        success={isEditSuccess}
        info={info}
      />

      <form onSubmit={CreateForm.onSubmit(async (values: FormDataInterface) => {
        // check if any changes have been made
        if (!isAvatarChanged && props?.data?.id && 
          (props.data.name === values.name)
        ) {
          setWarning('No changes made to the original content');
        } else {
          const submitFormData = new FormData();
          for (const property of (Object.keys(values))) {
            submitFormData.set(property, JSON.stringify(values[property as keyof FormDataInterface]));
          }
          if (avatarFile) {
            submitFormData.set('avatarFile', avatarFile);
          }
          submitFormData.set('isAvatarChanged', JSON.stringify(isAvatarChanged));
          try {
            const result = await fetch(
              props?.data?.id ? '/api/healthbars/' + props.data.id : '/api/healthbars',
              { 
                method: props?.data?.id ? 'PUT' : 'POST',
                body: submitFormData,
              },
            );
            if (result) {
              const responseJson = await result.json();
              if (responseJson.success) {
                setObsOverlayURL(window.location.origin + '/display/' + responseJson.data[0].id);

                // update main page list in parent component
                if (!props?.data?.id) {
                  // new monster
                  setIsSubmitted(true);
                  props.setData((prev) => ([
                    ...prev,
                    responseJson.data[0],
                  ]));
                  props.setModalName(responseJson.data[0].name);
                  setInfo('Monster created!')
                } else {
                  // edited monster
                  props.setData((prev) => prev.map((item) => item.id === responseJson.data[0].id ? responseJson.data[0] : item).sort((a, b) => a.updated_at < b.updated_at ? -1 : 1));
                  setIsEditSuccess('Monster values updated')
                }
                
                setWarning('');
                return setError('');
              } else {
                if (responseJson?.msg) {
                  throw responseJson.msg;
                }
                throw '';
              }
            }
          } catch (err) {
            return setError(err && typeof err === 'string' ? err : 'Could not submit settings');
          }
        }
        })
      }>
        <Grid>
          <Grid.Col span={5}>
            <Text size="sm">
            Health Bar Preview 
            </Text>
            <Card shadow="sm" padding="lg" radius="sm" withBorder>
              <Card.Section>
                {avatar ? (
                  <Image
                    src={avatar}
                    height={200}
                    alt="Image"
                  />
                ) : props?.data?.avatar_url ? (
                  <Image
                    src={window.location.origin + '/api/avatar/' + props?.data?.avatar_url}
                    height={200}
                    alt="Image"
                  />
                ) : (
                  <Group justify='center'>
                    <BsLayoutSidebarInsetReverse size={210} />
                    <Overlay color="#000" backgroundOpacity={0.35} blur={15} />
                  </Group>
                )}
              </Card.Section>
            </Card>
            <FileInput 
              accept="image/png,image/jpeg,image/gif,image/svg" 
              placeholder="Upload File" 
              onChange={(data) => {
                if (data) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event?.target) {
                      setAvatar(event?.target?.result);
                    }
                  };
                  reader.readAsDataURL(data);
                  setAvatarFile(data);
                  setIsAvatarChanged(true);
                }
              }}
            />
          </Grid.Col>

          <Grid.Col span={7}>
            <TextInput
              className={classes['margin-bottom-1']}
              required
              label="Name"
              placeholder="Health Bar #1"
              {...CreateForm.getInputProps('name')}
            />
          </Grid.Col>

        </Grid>

        {isSubmitted && (
          <>
            <Alert 
              mt="xl"
              variant="light" 
              color="indigo" 
              title="Display in OBS" 
              icon={
                <BiInfoCircle 
                  size="1rem" 
                  stroke={1.5} 
                />
              }
            >
              <div style={{ display: 'flex' }}>
                Copy the URL below to add as a
                <Space w="xs" />
                <b>browser source</b>
                <Space w="xs" />
                in OBS.
              </div>
              <div style={{ display: 'flex' }}>
                When enabled, the Twitch chat bot will actively count trigger strings to affect its health.
              </div>
            </Alert>

            <CopyButton 
              value={obsOverlayURL}
            >
              {({ copied, copy }) => (
                <Grid 
                  className={classes['margin-bottom-1']}
                  mt="xl" 
                  justify="center" 
                  style={{alignItems: 'center'}}
                >
                  <Grid.Col span={9}>
                    <TextInput 
                      label="OBS Overlay URL"
                      readOnly
                      mt="xs"
                      placeholder="OBS Overlay URL"
                      value={obsOverlayURL}
                    />
                  </Grid.Col>
                  <Grid.Col span={1} style={{ display: 'flex', alignItems: 'end' }}>
                    <Button 
                      mt={'xs'}
                      variant="outline"
                      color={copied ? 'teal' : theme.colors.indigo[5]} 
                      onClick={copy}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </Grid.Col>
                </Grid>
              )}
            </CopyButton>
          </>
        )}

        
        {!isSubmitted && (
          <Group justify="center" mt="xl">
            <Button 
              color={theme.colors.grape[5]}
              variant="gradient"
              gradient={{ from: theme.colors.grape[9], to: 'cyan', deg: 90 }}
              type="submit"
              leftSection={
                <MdBattery1Bar 
                  size="1rem" 
                  stroke={1.5} 
                />
              }
            >
              Create
            </Button>
          </Group>
        )}

        {props?.data?.id && (
          <Group justify="center" mt="xl">
            <Button 
              color={theme.colors.indigo[5]}
              variant="gradient"
              gradient={{ from: theme.colors.indigo[9], to: 'cyan', deg: 90 }}
              type="submit"
              disabled={isDeleteWarning}
              leftSection={
                <MdBattery1Bar 
                  size="1rem" 
                  stroke={1.5} 
                />
              }
            >
              Edit
            </Button>

            <Button 
              color={theme.colors.indigo[5]}
              variant="gradient"
              gradient={{ from: theme.colors.indigo[9], to: 'red', deg: 90 }}
              disabled={isDeleteWarning}
              onClick={(e) => {
                e.preventDefault();
                setIsDeleteWarning(true);
              }}
              leftSection={
                <AiFillDelete 
                  size="1rem" 
                  stroke={1.5} 
                />
              }
            >
              {isDeleteWarning ? 'Are you sure?' : 'Delete'}
            </Button>

            {isDeleteWarning && (
              <Button 
                variant="gradient"
                gradient={{ from: theme.colors.yellow[9], to: 'red', deg: 90 }}
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const result = await fetch(
                      '/api/healthbars/' + props?.data?.id,
                      { 
                        method: 'DELETE',
                      },
                    );
                    if (result) {
                      const responseJson = await result.json();
                      if (responseJson.success && responseJson?.data?.[0]?.id) {
                        props.setData((prev) => prev.filter((item) => item.id !== responseJson.data[0].id));
                        setWarning('');
                        setIsDeleteWarning(false);
                        return setError('');
                      } else {
                        if (responseJson?.msg) {
                          throw responseJson.msg;
                        }
                        throw '';
                      }
                    }
                  } catch (err) {
                    return setError(err && typeof err === 'string' ? err : 'Could not submit settings');
                  }
                }}
              >
                Delete
              </Button>
            )}
          </Group>
        )}
      </form>
    </>
  );
}

export default Properties;