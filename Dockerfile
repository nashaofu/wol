FROM --platform=amd64 alpine:latest as builder

WORKDIR /build

COPY build-docker.sh .

ARG TARGETARCH

RUN chmod +x ./build-docker.sh
RUN ./build-docker.sh

FROM alpine:latest

WORKDIR /opt/wol

COPY --from=builder /build/wol .

EXPOSE 3000
VOLUME ["/opt/wol/data"]

ENV RUST_LOG=info \
  RUST_BACKTRACE=1 \
  DATA_DIR=/opt/wol/data

CMD ["/opt/wol/wol"]
