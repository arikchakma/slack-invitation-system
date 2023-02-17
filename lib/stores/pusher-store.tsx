/**
 * Pusher Context
 *
 * This context is used to provide the pusher store to all components
 */
import { createContext } from 'react';

/**
 * Provider for Pusher Context
 */
import React, { useEffect, useState } from 'react';
import Pusher, { Channel, PresenceChannel } from 'pusher-js';
import { useStore } from 'zustand';
import { StoreApi, createStore } from 'zustand/vanilla';

interface PusherZustandStore {
  pusherClient: Pusher;
  channel: Channel;
  presenceChannel: PresenceChannel;
  members: Map<string, any>;
}

const pusher_key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY!;
const pusher_server_host = process.env.NEXT_PUBLIC_PUSHER_SERVER_HOST!;
const pusher_server_port = parseInt(
  process.env.NEXT_PUBLIC_PUSHER_SERVER_PORT!,
  10
);
const pusher_server_tls = process.env.NEXT_PUBLIC_PUSHER_SERVER_TLS === 'true';
const pusher_server_cluster = process.env.NEXT_PUBLIC_PUSHER_SERVER_CLUSTER!;

const createPusherStore = (slug: string) => {
  let pusherClient: Pusher;
  if (Pusher.instances.length) {
    pusherClient = Pusher.instances[0];
    pusherClient.connect();
  } else {
    pusherClient = new Pusher(pusher_key, {
      cluster: pusher_server_cluster,
      wsHost: pusher_server_host,
      wsPort: pusher_server_port,
      enabledTransports: pusher_server_tls ? ['ws', 'wss'] : ['ws'],
      forceTLS: pusher_server_tls,
      disableStats: true,
      authEndpoint: '/api/pusher/auth-channel',
    });
  }

  const channel = pusherClient.subscribe(slug);

  const presenceChannel = pusherClient.subscribe(
    `presence-${slug}`
  ) as PresenceChannel;

  const store = createStore<PusherZustandStore>(set => ({
    pusherClient,
    channel,
    presenceChannel,
    members: new Map(),
  }));

  // Update helper that sets 'members' to contents of presence channel's current members
  const updateMembers = () => {
    store.setState({
      members: new Map(Object.entries(presenceChannel.members.members)),
    });
  };

  // Bind all "present users changed" events to trigger updateMembers
  presenceChannel.bind('pusher:subscription_succeeded', updateMembers);
  presenceChannel.bind('pusher:member_added', updateMembers);
  presenceChannel.bind('pusher:member_removed', updateMembers);

  return store;
};

export const PusherContext = createContext<StoreApi<PusherZustandStore>>(null!);

export const PusherProvider: React.FC<
  React.PropsWithChildren<{ slug: string }>
> = ({ children, slug }) => {
  const [store, updateStore] = useState<ReturnType<typeof createPusherStore>>();

  useEffect(() => {
    const newStore = createPusherStore(slug);
    updateStore(newStore);
    const unsubscribe = newStore.subscribe(() => {
      console.log('Pusher Store Updated', newStore.getState());
    });
    return () => {
      const pusher = newStore.getState().pusherClient;
      console.log('disconnecting pusher and destroying store', pusher);
      console.log(
        '(Expect a warning in terminal after this, React Dev Mode and all)'
      );
      pusher.disconnect();
      unsubscribe();
    };
  }, [slug]);

  if (!store) return null;

  return (
    <PusherContext.Provider value={store}>{children}</PusherContext.Provider>
  );
};

/**
 * Section 3: "The Hooks"
 *
 * The exported hooks you use to interact with this store (in this case just an event sub)
 *
 * (I really want useEvent tbh)
 */
export function useSubscribeToEvent<MessageType>(
  eventName: string,
  callback: (data: MessageType) => void
) {
  const store = React.useContext(PusherContext);
  const channel = useStore(store, s => s.channel);

  const stableCallback = React.useRef(callback);

  // Keep callback sync'd
  React.useEffect(() => {
    stableCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const reference = (data: MessageType) => {
      stableCallback.current(data);
    };
    channel.bind(eventName, reference);
    return () => {
      channel.unbind(eventName, reference);
    };
  }, [channel, eventName]);
}

export const useCurrentMemberCount = () => {
  const store = React.useContext(PusherContext);
  const members = useStore(store, s => s.members);
  return members.size;
};