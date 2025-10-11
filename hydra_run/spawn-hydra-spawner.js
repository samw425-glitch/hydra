import Docker from 'dockerode';
import getPort from 'get-port';

const docker = new Docker();

export async function spawnContainer(image, env = {}, hostPort = 0, volumePath = null) {
  if (!hostPort) hostPort = await getPort();

  const binds = volumePath ? [`${volumePath}:/content`] : [];
  const container = await docker.createContainer({
    Image: image,
    Env: Object.entries(env).map(([k, v]) => `${k}=${v}`),
    HostConfig: { PortBindings: { '4000/tcp': [{ HostPort: `${hostPort}` }] }, Binds: binds },
  });

  await container.start();
  return { containerId: container.id, hostPort };
}
