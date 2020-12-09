FROM kurento/kurento-media-server:6.15.0

COPY kms-entrypoint.sh /kms-entrypoint.sh
RUN chmod 700 /kms-entrypoint.sh

ENTRYPOINT ["/kms-entrypoint.sh"]
