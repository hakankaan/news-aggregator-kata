# Docker configuration
IMAGE_NAME := news-aggregator
CONTAINER_NAME := news-aggregator-app
PORT := 3000
DEV_PORT := 5173

# Include .env file if it exists
-include .env
export

.PHONY: build run stop

build:
	docker build \
		--target production \
		-t $(IMAGE_NAME):latest .

run:
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):80 \
		-e VITE_APP_NEWSAPI_KEY=$(VITE_APP_NEWSAPI_KEY) \
		-e VITE_APP_GNEWS_KEY=$(VITE_APP_GNEWS_KEY) \
		-e VITE_APP_NYTIMES_KEY=$(VITE_APP_NYTIMES_KEY) \
		-e VITE_APP_APP_URL=$(VITE_APP_APP_URL) \
		$(IMAGE_NAME):latest
	@echo "Application running at http://localhost:$(PORT)"


stop:
	-docker stop $(CONTAINER_NAME) $(CONTAINER_NAME)-dev 2>/dev/null
	-docker rm $(CONTAINER_NAME) $(CONTAINER_NAME)-dev 2>/dev/null

logs:
	docker logs -f $(CONTAINER_NAME)

