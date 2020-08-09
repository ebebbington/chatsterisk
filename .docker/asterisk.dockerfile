FROM centos:6

# Set up EPEL
RUN curl -L http://download.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm -o /tmp/epel-release-6-8.noarch.rpm && \
 rpm -ivh /tmp/epel-release-6-8.noarch.rpm && \
 rm -f /tmp/epel-release-6-8.noarch.rpm

# Update and install asterisk
RUN yum update -y && yum install -y asterisk

# Set config as a volume
VOLUME /etc/asterisk

# And when the container is started, run asterisk
ENTRYPOINT [ "/usr/sbin/asterisk", "-f" ]