git rev-parse HEAD > public/revision.txt
docker build . --rm --no-cache  -t tracardi/tracardi-gui:0.7.4-dev
docker push tracardi/tracardi-gui:0.7.4-dev
