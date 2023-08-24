import base64
import io
from logging import getLogger

from attrs import define, field
from dynaconf import settings
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

logger = getLogger(__name__)


@define
class SlackService:
    token: str = field()
    client: WebClient = field(init=False)

    def __attrs_post_init__(self):
        self.client = WebClient(token=self.token)

    def _decode_image_data(self, image_data):
        if image_data.startswith(b"data:image/png;base64,"):
            image_data = image_data.split(b",")[1]
        return base64.b64decode(image_data)

    def upload_image_to_channel(self, channel, image_data, image_name):
        decoded_image = self._decode_image_data(image_data)
        image_io = io.BytesIO(decoded_image)
        try:
            self.client.files_upload_v2(
                channel=channel, file=image_io, filename=image_name
            )
        except SlackApiError as e:
            logger.error(f"Error uploading image: {e.response['error']}")


def get_slack_service():
    yield SlackService(settings.SLACK_API_TOKEN)
