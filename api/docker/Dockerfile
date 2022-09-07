FROM debian:jessie

RUN rm -rf /var/lib/apt/lists/* \
&& apt-get update \
&& apt-get install -y supervisor

RUN rm -rf /var/lib/apt/lists/* \
&& apt-get update \
&& apt-get install -y curl \
&& curl -sL https://deb.nodesource.com/setup_6.x | bash - \
&& apt-get install -y nodejs

RUN mkdir /api
WORKDIR /api
COPY supervisor-api.conf /etc/supervisor/conf.d/api.conf
RUN mkdir /var/run/api
RUN mkdir /var/log/api

COPY run.sh /
RUN chmod +x /run.sh
CMD /run.sh
