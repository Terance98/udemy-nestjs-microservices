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
- Once that is done. `kubectl get po` will show all the services as running now.
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

## Deploying to AWS EKS

- Setup Elastic Container Registry
- Setup aws cli
- Run `aws configure`. Generate a new access key and provide its values
- Go to ECR, then select a repository and "View push commands"
- Follow through the commands except the build command. For that cd to apps/reservations and `docker build -t reservations -f ./Dockerfile ../../`
- Setup the buildspec.yaml file
- Setup a CodePipeline for CI/CD. Setup a new code pipeline, choose github v2, connect to github account and choose the repository. Under trigger choose "No Filter".
- Follow through and select the repo and branch. Click Next. Create a new project. Give a project name. Under buildspec, choose -> use a buildspec file. Then continue through
- Click next and choose skip deploy stage -> Create Pipeline
- A build will start automatically and it might error due to permission issues. To fix that, go to IAM -> Roles ->
  codebuild-sleepr-service-role -> Add permissions -> Search for ecr -> Select EC2InstanceProfileForImageBuilderECRContainerBuilds -> Click add permissions
- To deploy again, go to code pipeline -> Release change
- Once the code build is done, new images would be available under each repository of ECR
- For EKS, install eksctl. Follow the installation steps to get it installed
- `eksctl get clusters` - will return no clusters found since we haven't created.
- Copy the cluster.yaml file template from the getting started page for eksctl
- cd into sleepr directory and save the file as cluster.yaml inside the project root directory. Make a few updates to it as required. Also setup its schema.
- Run `eksctl create cluster -f ./cluster.yaml`. This will create a cluster and start setting up the nodes. It might take up to 15 mins to set it all up.
- `kubectl get nodes` - to list out the nodes
- `eksctl get nodegroups --cluster sleepr` - Will show the node groups which we have set as 3.
- Now update all deployment scripts to point to the docker image from the ECR. Get the urls from buildspec.yaml file
- Now we need to move all the secrets to the EKS.
- `kubectl config use-context docker-desktop` - this will switch to the local context
- `kubectl get secrets - yaml > secrets.yaml` - this will export the secrets to a secrets.yaml file.
- Remove the gcr_json_key from the secrets.yaml file
- `kubectl config get-contexts`
- `kubectl config use-context iam-root-account@sleepr.us-east-1.eksctl.io`
- `kubectl create -f secrets.yaml`
- Delete the secrets.yaml file
- Use ` helm install sleepr .` if its the first time we are setting it up. Else use `helm upgrade sleepr .`
- `kubectl get po` - will list out the containers as running. 
- If any of the containers are in pending state check `kubectl describe po reservations-5ccbfb9c79-cf656`.
- If any of the services are not running due to insufficient node groups then run `eksctl get nodegroups --cluster sleepr`
- Run `eksctl scale nodegroup ng-1 -N 5 --cluster sleepr -M 5` && run `helm upgrade sleepr .`

- Next step is to provision a load balancer to this cluster
- Go to `https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/` to follow the steps to setup AWS load balancer controller
- Go Deployment section -> Configure IAM -> Option A
- Following are the list of commands executed. For the second command choose "If your cluster is in any other region:" from the document
- ````eksctl utils associate-iam-oidc-provider
    --region us-east-1 \
    --cluster sleepr \
    --approve```
  ````
- `curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.8.2/docs/install/iam_policy.json`
- ````aws iam create-policy
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam-policy.json```
  ````
- ````eksctl create iamserviceaccount
    --cluster=sleepr \
    --namespace=kube-system \
    --name=aws-load-balancer-controller \
    --attach-policy-arn=arn:aws:iam::555812340215:policy/AWSLoadBalancerControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --region us-east-1 \
    --approve```
  ````
- Move to the summary section in the documentation
- `helm repo add eks https://aws.github.io/eks-charts`
- ````wget https://raw.githubusercontent.com/aws/eks-charts/master/stable/aws-load-balancer-controller/crds/crds.yaml
  kubectl apply -f crds.yaml```
  ````
- `helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=sleepr --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller`
- `kubectl get po -n kube-system`. This will show the load balancers that are running.
- `kubectl logs aws-load-balancer-controller-67b98f6ff5-dmhq9 -n kube-system --follow` - will show the logs of the AWS load balancer controller that is running now
- Delete the temporary `iam-policy.json` that was created
- Update the ingress.yaml file to add annotations config.
- `helm upgrade sleepr .`
- Allow some time for the ingress load balancer to set up with its external ip address
- `kubectl get ing`
- Meanwhile we can go to AWS -> EC2 -> Load Balancers -> See the list of load balancers that are provisioning/provisioned


### Debugging
- Checkout the update made in the start:debug command in root package.json
- Make a few adjustments in the root docker-compose.yml file for the microservice we wish to debug. Here in this case we have chosen reservations
- On the side nav of VsCode, choose Debug section and click "create a launch.json file" -> Choose Node.js as run time. Now a .vscode folder will be created with the launch.json file
- Make updates to the launch.json
- Then add break points within the code and start debugging session from the side nav -> Select "Run and Debug" -> Click "Start Debugging". 
- Now as we continue through the break points we can see the status of different variables in the left pane 