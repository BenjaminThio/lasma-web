import type { CodeLanguage } from '@/lib/highlight';

export interface CodeSample {
    id: string;
    filename: string;
    language: CodeLanguage;
    code: string;
}

/** Integration snippets, built with the origin the site is actually served from. */
export function buildCodeSamples(origin: string): CodeSample[] {
    const api = `${origin}/api/leaderboard`;

    return [
        {
            id: 'godot',
            filename: 'leaderboard.gd',
            language: 'gdscript',
            code: `extends Node

const API_URL := "${api}"
const APP_ID := "YOUR_APP_ID"
const WRITE_KEY := "YOUR_WRITE_KEY"

@onready var http := HTTPRequest.new()

func _ready() -> void:
    add_child(http)
    http.request_completed.connect(_on_request_completed)

func submit_score(player_name: String, score: int) -> void:
    var query := "?appId=%s&name=%s&score=%d" % [APP_ID, player_name.uri_encode(), score]
    var headers := ["X-Api-Key: " + WRITE_KEY]
    http.request(API_URL + query, headers, HTTPClient.METHOD_POST)

func _on_request_completed(_result, code, _headers, body) -> void:
    var data = JSON.parse_string(body.get_string_from_utf8())
    if code == 200 or code == 201:
        print("Ranked #%d" % data.success.rank)`,
        },
        {
            id: 'unity',
            filename: 'Leaderboard.cs',
            language: 'csharp',
            code: `using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class Leaderboard : MonoBehaviour
{
    const string ApiUrl = "${api}";
    const string AppId = "YOUR_APP_ID";
    const string WriteKey = "YOUR_WRITE_KEY";

    public IEnumerator SubmitScore(string playerName, int score)
    {
        var url = $"{ApiUrl}?appId={AppId}&name={UnityWebRequest.EscapeURL(playerName)}&score={score}";

        using var request = UnityWebRequest.PostWwwForm(url, "");
        request.SetRequestHeader("X-Api-Key", WriteKey);
        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
            Debug.Log(request.downloadHandler.text);
    }
}`,
        },
        {
            id: 'javascript',
            filename: 'leaderboard.js',
            language: 'javascript',
            code: `const API_URL = '${api}';

export async function submitScore(name, score) {
  const params = new URLSearchParams({ appId: 'YOUR_APP_ID', name, score: String(score) });
  const response = await fetch(\`\${API_URL}?\${params}\`, {
    method: 'POST',
    headers: { 'X-Api-Key': 'YOUR_WRITE_KEY' },
  });

  const body = await response.json();
  if (!response.ok) throw new Error(body.error);

  return body; // { success: { id, name, score, datetime, rank }, leaderboard: [...] }
}`,
        },
        {
            id: 'curl',
            filename: 'terminal.sh',
            language: 'bash',
            code: `# Submit a score (keep success.id to update this player later)
curl -X POST "${api}?appId=YOUR_APP_ID&name=Benjamin%20Thio&score=999" \\
  -H "X-Api-Key: YOUR_WRITE_KEY"

# Read the top 10
curl "${api}?appId=YOUR_APP_ID&limit=10"

# Next page: pass the X-Next-Cursor response header back
curl -i "${api}?appId=YOUR_APP_ID&cursor=NEXT_CURSOR"`,
        },
    ];
}
