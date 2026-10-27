FROM python:3.12-slim-bookworm

ARG TARGETARCH
ARG TERRAFORM_VERSION=1.15.9
ARG TERRAGRUNT_VERSION=1.1.6
ARG TFLINT_VERSION=0.63.1
ARG TFLINT_AWS_RULESET_VERSION=0.44.0
ARG CHECKOV_VERSION=3.3.30

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git unzip \
  && rm -rf /var/lib/apt/lists

RUN curl -fsSLo /tmp/terraform.zip "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_${TARGETARCH}.zip" \
  && unzip -q /tmp/terraform.zip terraform -d /usr/local/bin \
  && rm /tmp/terraform.zip

RUN curl -fsSLo /usr/local/bin/terragrunt "https://github.com/gruntwork-io/terragrunt/releases/download/v${TERRAGRUNT_VERSION}/terragrunt_linux_${TARGETARCH}" \
  && chmod +x /usr/local/bin/terragrunt

RUN curl -fsSLo /tmp/tflint.zip "https://github.com/terraform-linters/tflint/releases/download/v${TFLINT_VERSION}/tflint_linux_${TARGETARCH}.zip" \
  && unzip -q /tmp/tflint.zip tflint -d /usr/local/bin \
  && rm /tmp/tflint.zip

RUN mkdir -p "/root/.tflint.d/plugins/github.com/terraform-linters/tflint-ruleset-aws/${TFLINT_AWS_RULESET_VERSION}" \
  && curl -fsSLo /tmp/ruleset.zip "https://github.com/terraform-linters/tflint-ruleset-aws/releases/download/v${TFLINT_AWS_RULESET_VERSION}/tflint-ruleset-aws_linux_${TARGETARCH}.zip" \
  && unzip -q /tmp/ruleset.zip tflint-ruleset-aws -d "/root/.tflint.d/plugins/github.com/terraform-linters/tflint-ruleset-aws/${TFLINT_AWS_RULESET_VERSION}" \
  && rm /tmp/ruleset.zip

RUN ARCH="$(uname -m)" \
  && curl -fsSLo /tmp/awscli.zip "https://awscli.amazonaws.com/awscli-exe-linux-${ARCH}.zip" \
  && unzip -q /tmp/awscli.zip -d /tmp \
  && /tmp/aws/install \
  && rm -rf /tmp/aws /tmp/awscli.zip

RUN pip install --no-cache-dir "checkov==${CHECKOV_VERSION}"

ENV TF_IN_AUTOMATION=1 \
  TF_PLUGIN_CACHE_DIR=/cache/terraform-plugins \
  TG_DOWNLOAD_DIR=/cache/terragrunt \
  CHECKOV_RUN_SCA_PACKAGE_SCAN=false

WORKDIR /workspace

ENTRYPOINT ["sh", "/workspace/infra/tools/infra.sh"]
CMD ["help"]
