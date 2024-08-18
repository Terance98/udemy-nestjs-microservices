<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## Steps to push docker image to GCP

- cd app/reservations and `docker build -t reservations -f ./Dockerfile ../../`. This will build the reservations microservice
- Tag the microservice with the GCP artifact registry repository address ( copy it from the GCP dashboard ). `docker tag reservations asia-south1-docker.pkg.dev/biggle-ai/reservations/production`. Here production is the name of the image
- Push the image to GCP - `docker image push asia-south1-docker.pkg.dev/biggle-ai/reservations/production`

## Steps to setup kubernetes

- Make sure that Helm is installed and kubernetes engine is running via the docker desktop client.
- Make a new folder named k8s in the root directory and cd into it. Then run `helm create sleepr`. This will create some boiler plate config for the kubernetes deployment. Remove everything from the templates folder and remove all the content from values.yaml as well.
- `kubectl create deployment reservations --image=asia-south1-docker.pkg.dev/biggle-ai/reservations/production --dry-run=client -o yaml > deployment.yaml`. This will generate a deployment.yaml file that we can work with.
- After removing few unwanted keys from it, create a new folder named reservations under templates and move the deployment.yaml to it.
- Then run `helm install sleepr .` This will do the kubernetes deployment
- But it will fail because we don't have the permissions to pull the docker image from GCP
- For that go to API & Services in GCP -> Credentials -> Create Credentials -> Service Account -> Name it continue -> Artifact Registry Reader -> Done
- The service account created will now be available under the API & Services tab under Service Accounts. Open it -> Keys -> Create key ( choose JSON ) -> Download it
- Run `kubectl create secret docker-registry gcr-json-key --docker-server=asia-south1-docker.pkg.dev --docker-username=_json_key --docker-password="$(cat ~/Downloads/biggle-ai-c9174348d168.json)" --docker
-email=thomasterance98@gmail.com`. This command mainly contains the path to docker server ( available under setup instruction from Artifact Registry ) and also the path to the json key. This is done so that we have the permissions to pull docker images from GCP Artifact Registry into our local kubernetes engine.
- `kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "gcr-json-key"}]}'   `
- `kubectl rollout restart deployment reservations`
- It will fail again due to env variable issues. But we will fix it in the following steps.
- Continue the create deployment command from step 3 to continue creating deployment scripts for all the microservices within their corresponding folders
- Navigate to the k8s/sleepr and run `helm upgrade sleepr .`
- Run `kubectl get po` command to check if the kubernetes clusters have all started up. But it will still error and exit due to env variable issues
- Run `kubectl create secret generic mongodb --from-literal=connectionString=mongodb+srv://connection_string`. This will setup the connection string as a secure secret variable inside the kubernetes
- `kubectl get secrets` - will list out the secrets created so far.
- `kubectl get secret mongodb -o yaml` - will display the secret but the content will be in hashed format
- Add a few lines to point to this env variable in the deployment script under env key
- Create few more env variables for the notifications service. `kubectl create secret generic google --from-literal=clientSecret=your_google_client_secret --from-literal=refreshToken=refresh_token`
- Setup the env variables for the notifications service deployment.yaml script. Then run `helm upgrade sleepr .` && `kubectl get po`. This will list out all the pods and notifications service would be running fine.
- We can check the logs of notifications service by `kubectl logs notification_service_name`. We can get the name for notifications service from the `kubectl get po` command.

- `kubectl create service clusterip notifications --tcp=3000 --dry-run=client -o yaml > service.yaml`. This will create a service.yaml file that we can configure for the notifications service to establish TCP connectivity to it.
- cd back to /sleepr and run `helm upgrade sleepr .` and `kubectl get svc`. We should be able to see notifications service now running at port 3000
- Set the env variables for the rest of the services
- `kubectl create service clusterip payments --tcp=3001 --dry-run=client -o yaml > service.yaml`. Setting up tcp connections for payments microservice. Make sure that the payments microservice is running before this.
- `kubectl create service clusterip auth --tcp=3002,3003 --dry-run=client -o yaml > service.yam;`. Setting up open ports for tcp and http connections for auth microservice. Make sure auth microservice is running before this.
- `helm upgrade sleepr .` - for it to take effect
- `kubectl create service nodeport reservations --tcp=3004 --dry-run=client -o yaml > service.yaml`. This is another variation of create service command with `nodeport` method. This will expose the service to a specific port.

- As of writing this Readme, the mongodb atlas server is timing out its connection in kubernetes server. So we have hard coded the local mongodb server url for now

## Deploying to GCP Kubernetes Engine
- Create a kubernetes egnine in GCP
- `gcloud components install gke-gcloud-auth-plugin`
- `gcloud container clusters get-credentials autopilot-cluster-1 --region asia-south1 --project biggle-ai`
- `kubectl get nodes`
- `kubectl get namespaces`
- `kubectl get po -n kube-system`
- cd into sleepr directory and `helm install sleepr .` This will setup all the kubernetes clusters in pending state
- `kubectl get po`. Will list all the microservices as in pending state
- `kubectl get nodes` will list out the nodes that have been setup for deployment
- `kubectl get po`. Will list out the microservices again but all of them will be in error state since there are no env variables defined
- `kubectl describe po auth-66fcbd684c-k5qtl`. The final value in the command is the value from the above command. This will show the error that occurred which is the monodb variable not found error
- `kubectl config get-contexts`. This will list out the various contexts that are available. 
- `kubectl config use-context docker-desktop`. This will checkout to the local context.
- Make sure docker + kubernetes is running locally and run `kubectl get secrets`. This will list out the secrets that are available locally
- `kubectl get secret stripe -o yaml > stripe.yaml`. This will export the stripe secret to a new file.
- Repeat the process for the rest of the secrets
- `kubectl config get-contexts`
- `kubectl config use-context gke_biggle-ai_asia-south1_autopilot-cluster-1`. Switching back to the GCP Kubernetes Engine context to copy all the secrets to it
- `kubectl create -f google.yaml`. This will copy the google secret to the new hosted cluster. Repeat the same process for the rest of the secrets
- Once that is done.  `kubectl get po` will show all the services as running now.
- Delete all the secrets that we just generated in to the files.
- `kubectl logs auth-66fcbd684c-k5qtl` to ensure everything is running as expected
- `kubectl get svc` to see the services are running either as TCP or NodePorts and their exposed PORTS as well


- Next step is to setup ingress load balancer
- Create a new file named `ingress.yaml` inside the templates folder
- After filling it out, run `helm upgrade sleepr .`
- After that if we go to GCP -> Kubernetes Engine -> Networking ( Gateway, Services and Ingress ) -> Ingress. We can see that the ingress is being created for our 2 services
- Once the ingress is created, then run `kubectl get ing`. This will list out the public ip for the load balancer which we can use to communicate.
- Give it some time to finish up the health checks before it can be actually useable. 
- Test out the auth/login api to login with an already existing user and also /reservations to test creation of a reservation. The /users route won't work since it was not configured