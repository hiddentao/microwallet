'use client'

import React, { FC, useContext, useEffect } from 'react'
import Ably from 'ably'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import request from 'graphql-request'
import { graphqlApiEndpoint } from '../hooks'
import { generateAblyTokenMutation } from '@microwallet/shared'
import { PubSubMessage } from '@microwallet/shared'

export interface GlobalContextValue {
  user: Session['user']
}

export const GlobalContext = React.createContext({} as GlobalContextValue)

export const GlobalProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const [isAblyConnecting, setIsAblyConnecting] = React.useState<boolean>(false)
  const [ably, setAbly] = React.useState<Ably.Types.RealtimePromise>()

  const session = useSession()

  useEffect(() => {
    if (session.status === 'authenticated') {
      if (!ably && !isAblyConnecting) {
        ;(async () => {
          try {
            setIsAblyConnecting(true)

            const a = new Ably.Realtime.Promise({
              authCallback: (_ignore, cb) => {
                request(graphqlApiEndpoint, generateAblyTokenMutation)
                  .then((data) => {
                    if (data?.result) {
                      cb(null, data.result)
                    } else {
                      console.warn('No ably token returned')
                    }
                  })
                  .catch((err) => {
                    console.error(err)
                    cb(err, null)
                  })
              },
            })

            a.connection.on('disconnected', () => {
              console.warn('Ably disconnected')
            })

            a.connection.on('failed', () => {
              console.warn('Ably failed')
            })

            await a.connection.once('connected')
            console.log('Ably connected')

            a.channels
              .get(session.data.user!.name!)
              .subscribe('msg', ({ data }: { data: PubSubMessage }) => {
                window.postMessage(data, '*')
              })

            setAbly(a)
          } catch (e) {
            console.error(`Ably connection error`, e)
          } finally {
            setIsAblyConnecting(false)
          }
        })()
      }
    } else {
      if (ably) {
        ably.close()
        setAbly(undefined)
        setIsAblyConnecting(false)
      }
    }
  }, [session.status, session.data, isAblyConnecting, ably])

  return (
    <GlobalContext.Provider
      value={{
        user: session.data?.user,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const GlobalConsumer = GlobalContext.Consumer

export const useGlobalContext = () => {
  return useContext(GlobalContext)
}
