#!/bin/bash -x
set -e

rm /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
touch /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
chmod 777 /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini

if [ -n "$KMS_PORT" ]; then
      sed -i "s/\"port\": 8888/\"port\": $KMS_PORT/g" /etc/kurento/kurento.conf.json
fi

if [ -n "$KMS_TURN_URL" ]; then
      echo "turnURL=$KMS_TURN_URL" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
fi

if [ -n "$KMS_STUN_IP" -a -n "$KMS_STUN_PORT" ]; then
  echo "stunServerAddress=$KMS_STUN_IP" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
  echo "stunServerPort=$KMS_STUN_PORT" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
fi

if [ -n "$BIND_INTERFACE" ]; then
    echo "networkInterfaces=$BIND_INTERFACE" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
fi

if [ -n "$EXTERNAL_ADDRESS" ]; then
    echo "externalAddress=$EXTERNAL_ADDRESS" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
fi

exec /usr/bin/kurento-media-server -d /var/log/kurento-media-server "$@"
