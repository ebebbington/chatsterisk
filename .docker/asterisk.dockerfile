FROM centos:7

ARG DENO_VERSION

# Set up EPEL
RUN curl -L http://download.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm -o /tmp/epel-release-6-8.noarch.rpm && \
 rpm -ivh /tmp/epel-release-6-8.noarch.rpm && \
 rm -f /tmp/epel-release-6-8.noarch.rpm

# Update and install asterisk
RUN yum update -y && yum install -y asterisk

# Set config as a volume
VOLUME /etc/asterisk

RUN yum install -y unzip curl

# And when the container is started, run asterisk
#ENTRYPOINT [ "/usr/sbin/asterisk", "-fcvvvv" ]

COPY ./.docker/asterisk-entrypoint.sh /asterisk-entrypoint.sh
RUN chmod +x /asterisk-entrypoint.sh
ENTRYPOINT ["/asterisk-entrypoint.sh"]