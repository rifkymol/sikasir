"""
Tests for the health check endpoint.
"""


def test_health_check(client):
    # Arrange
    url = "/api/health"

    # Act
    response = client.get(url)

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ok"
