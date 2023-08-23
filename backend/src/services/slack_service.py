from logging import getLogger

from attrs import define
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
import base64
import io


logger = getLogger(__name__)


@define
class SlackService:
    @staticmethod
    def upload_image_to_channel(token, channel, image_data, image_name):
        client = WebClient(token=token)
        if image_data.startswith("data:image/png;base64,"):
            image_data = image_data.split(",")[1]
        image_data = base64.b64decode(image_data)
        image_io = io.BytesIO(image_data)
        try:
            client.files_upload(channels=channel, file=image_io, filename=image_name)
        except SlackApiError as e:
            logger.error(f"Error uploading image: {e.response['error']}")
