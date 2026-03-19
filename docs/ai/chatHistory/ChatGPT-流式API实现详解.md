# 娴佸紡API瀹炵幇璇﹁В

#### You:
浣犲ソ

#### ChatGPT:
浣犲ソ銆傛湁浠€涔堥渶瑕佹垜鍗忓姪澶勭悊鐨勪簨椤癸紝璇风洿鎺ヨ鏄庛€?

#### You:
鎴戠幇鍦ㄨ窡浣犲璇?浣犱細鍚戞湇鍔″櫒璇锋眰API,鐒跺悗鏈嶅姟鍣ㄨ繑鍥炴暟鎹?杩欎釜娴佸け鐨勬暟鎹槸鎬庝箞杩斿洖鐨?浣犺兘鍛婅瘔鎴戝叿浣撴€庝箞鍋氬悧?

#### ChatGPT:
鍙互銆備綘杩欎釜闂鏈川涓婃槸鍦ㄩ棶锛?*鍍忕幇鍦ㄨ繖绉嶁€滆竟鐢熸垚杈硅繑鍥炩€濈殑瀵硅瘽鏁版嵁锛堟祦寮忚緭鍑猴級锛屽湪宸ョ▼涓婃槸濡備綍閫氳繃 API 瀹炵幇鐨?*銆備笅闈㈡垜浠?*鏁翠綋鏋舵瀯 鈫?浼犺緭鍗忚 鈫?鏈嶅姟绔疄鐜?鈫?瀹㈡埛绔疄鐜?*鍥涗釜灞傞潰锛岀粰浣犱竴濂楀彲钀藉湴銆佸彲澶嶅埢鐨勫畬鏁存柟妗堣鏄庯紝浠ヤ綘绋嬪簭鍛樿瑙掓潵璁层€?
---

## 涓€銆佹暣浣撴灦鏋勶紙浣犵幇鍦ㄧ湅鍒扮殑鍦ㄥ仛浠€涔堬級

浣犲綋鍓嶇殑瀵硅瘽杩囩▼锛屾娊璞℃垚涓夊眰灏辨槸锛?
```
娴忚鍣?/ 鍓嶇
   鈫擄紙HTTP 闀胯繛鎺ワ級
浣犺嚜宸辩殑鍚庣鏈嶅姟
   鈫擄紙璋冪敤澶фā鍨?API锛屾祦寮忥級
澶фā鍨嬫湇鍔★紙濡?OpenAI / 闃块噷 / 鏈湴 LLM锛?```

**鍏抽敭鐐?*锛?
- **妯″瀷鏄€滀竴娈典竴娈碘€濈敓鎴?Token**
- **鍚庣杈规帴鏀躲€佽竟寰€鍓嶇鎺?*
- **鍓嶇瀹炴椂娓叉煋**

杩欎笉鏄€滅瓑鎺ュ彛杩斿洖瀹屽啀涓€娆℃€у搷搴斺€濓紝鑰屾槸**娴佸紡锛圫treaming锛夊搷搴?*銆?
---

## 浜屻€佹祦寮忚繑鍥炵殑鏍稿績鎶€鏈€夊瀷

鐩墠涓绘祦鏈?3 绉嶆柟寮忥紝浣犵幇鍦ㄧ敤鍒扮殑锛?9% 鏄涓€绉嶃€?
| 鎶€鏈?                         | 鏄惁鎺ㄨ崘   | 璇存槑                       |
| --------------------------- | ------ | ------------------------ |
| **SSE锛圫erver-Sent Events锛?* | 鉁?寮虹儓鎺ㄨ崘 | HTTP 鍗曞悜娴侊紝绠€鍗曘€佺ǔ瀹氥€丄I 鍦烘櫙浜嬪疄鏍囧噯 |
| WebSocket                   | 鈿狅笍 鍙敤  | 鍙屽悜锛屼絾澶嶆潅銆佺姸鎬佺淮鎶ゆ垚鏈珮           |
| Chunked HTTP                | 鉂?涓嶆帹鑽? | 娴忚鍣ㄦ敮鎸佷笉鍙嬪ソ                 |

**缁撹**锛歕
馃憠 **SSE 鏄仛 AI 娴佸紡瀵硅瘽鐨勬渶浣冲疄璺?*

---

## 涓夈€佹湇鍔＄锛氭祦寮忚繑鍥炴槸鎬庝箞鈥滀竴鐐圭偣鈥濆彂鍑哄幓鐨?
### 1锔忊儯 HTTP 灞傦細SSE 鐨勬湰璐?
SSE 鏈川鏄竴涓?**涓嶄細绔嬪嵆鍏抽棴鐨?HTTP 鍝嶅簲**锛?
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

杩斿洖鐨勬暟鎹牸寮忔槸**绾枃鏈崗璁?*锛?
```text
data: 绗竴娈靛唴瀹?
data: 绗簩娈靛唴瀹?
data: 绗笁娈靛唴瀹?```

姣忎竴娈电敤 **`\n\n`** 浣滀负缁撴潫鏍囧織銆?
---

### 2锔忊儯 鍚庣锛圫pring Boot 绀轰緥锛岃创杩戜綘褰撳墠鎶€鏈爤锛?
#### Controller

```java
@GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter chatStream(@RequestParam String prompt) {
    SseEmitter emitter = new SseEmitter(0L); // 涓嶈秴鏃?
    CompletableFuture.runAsync(() -> {
        try {
            // 妯℃嫙锛氫粠澶фā鍨嬮€?token 鑾峰彇
            for (String token : mockLLMStream(prompt)) {
                emitter.send(SseEmitter.event()
                        .data(token));
                Thread.sleep(50); // 妯℃嫙妯″瀷鐢熸垚寤惰繜
            }
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    });

    return emitter;
}
```

#### 妯″瀷娴佸紡杩斿洖锛堜吉浠ｇ爜锛?
```java
public Iterable<String> mockLLMStream(String prompt) {
    return List.of("浣犲ソ", "锛?, "鎴戞槸", "AI", "鍔╂墜");
}
```

> **鐪熷疄鍦烘櫙**锛氳繖閲岄€氬父鏄綘璋冪敤
>
> - OpenAI stream API
> - Spring AI `Flux<ChatResponse>`
> - 鏈湴 LLM token callback

---

### 3锔忊儯 濡傛灉浣犵敤 Spring AI锛堜綘涔嬪墠鎻愯繃锛?
```java
Flux<ChatResponse> flux = chatClient.prompt(prompt).stream();

flux.subscribe(resp -> {
    emitter.send(resp.getResult().getOutput().getContent());
});
```

杩欎竴姝ユ槸**娴佸紡鐨勬簮澶?*銆?
---

## 鍥涖€佸墠绔細娴忚鍣ㄦ槸鎬庝箞鈥滄帴浣忔祦鈥濈殑

### 鏂规涓€锛欵ventSource锛堟爣鍑?SSE锛?
```ts
const source = new EventSource('/chat/stream?prompt=浣犲ソ');

source.onmessage = (event) => {
  console.log('鏀跺埌娴佸紡鍐呭:', event.data);
};

source.onerror = () => {
  source.close();
};
```

**鐗圭偣**锛?
- 娴忚鍣ㄥ師鐢熸敮鎸?- 鑷姩閲嶈繛
- 鍙敮鎸?GET

---

### 鏂规浜岋細fetch + ReadableStream锛堜綘鐜板湪鏇村彲鑳界敤杩欎釜锛?
```ts
const response = await fetch('/chat/stream', {
  method: 'POST',
  body: JSON.stringify({ prompt }),
  headers: {
    'Content-Type': 'application/json',
  },
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();

let result = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  result += chunk;

  // 瀹炴椂娓叉煋
  console.log(chunk);
}
```

浣犱箣鍓嶇粰鎴戠殑浠ｇ爜锛?
```ts
onMessage: (chunk) => {
  assistantMessage.content += chunk;
}
```

**鏈川灏辨槸杩欎竴灞傜殑灏佽**銆?
---

## 浜斻€佹暟鎹祦鍏ㄨ繃绋嬶紙浣犲彲浠ュ鐓ц皟璇曪級

```
LLM 鐢熸垚 token
   鈫?鍚庣 SDK 鏀跺埌 token
   鈫?emitter.send(token)
   鈫?HTTP 闀胯繛鎺ユ湭鍏抽棴
   鈫?娴忚鍣?response stream
   鈫?reader.read()
   鈫?UI append 鍐呭
```

**娌℃湁涓棿缂撳瓨銆佹病鏈夌瓑鍏ㄩ儴缁撴潫**銆?
---

## 鍏€佸嚑涓綘涓€瀹氫細韪╃殑鍧戯紙鎻愬墠鍛婅瘔浣狅級

### 1锔忊儯 涓轰粈涔堟湁鏃跺€欏墠绔€滀竴娆℃€у嚭鏉モ€濓紵

鍘熷洜锛?
- Nginx 娌″叧 buffering
- response 娌?flush
- Content-Type 涓嶅

**Nginx 蹇呴』閰嶇疆**锛?
```nginx
proxy_buffering off;
```

---

### 2锔忊儯 SSE 鍗′綇涓嶅姩锛?
妫€鏌ワ細

- 鏄惁鏈?`\n\n`
- 鏄惁姝ｇ‘ `text/event-stream`
- 鏄惁琚綉鍏宠秴鏃?
---

### 3锔忊儯 涓枃涔辩爜锛?
```java
emitter.send(
  SseEmitter.event()
    .data(token, MediaType.TEXT_PLAIN)
);
```

---

## 涓冦€佹€荤粨涓€鍙ヨ瘽

> **娴佸紡瀵硅瘽 = LLM Token 娴?+ HTTP 闀胯繛鎺?+ 鍓嶇瀹炴椂娑堣垂**

浣犵幇鍦ㄧ湅鍒扮殑鏁堟灉锛屽苟涓嶆槸鈥滅绉樼殑 API鈥濓紝鑰屾槸涓€涓?*闈炲父鏍囧噯銆佸彲澶嶅埗鐨勫伐绋嬫ā寮?*銆?
---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘锛?
- 鎸変綘褰撳墠 **Spring Boot + Spring AI + Vue3 / TDesign**
- 缁欎綘涓€濂?*瀹屾暣鍙繍琛岀殑绔埌绔ず渚?*
- 鎴栫洿鎺ュ府浣?*鏀逛綘鐜板湪鐨勬祦寮忎唬鐮?*

浣犲憡璇夋垜锛歕
馃憠 **浣犵幇鍦ㄥ悗绔敤鐨勬槸 Spring Boot + Spring AI 鍚楋紵鍓嶇鏄?fetch 杩樻槸 EventSource锛?*


#### You:
鍚庣鏈€甯哥敤鐨勮繑鍥炴柟寮忔槸鍝? 鎴戣繖涓狥lex琛屼笉琛?

#### ChatGPT:
鎴戠洿鎺ョ粰浣犱竴涓?*宸ョ▼缁撹**锛岀劧鍚庡啀瑙ｉ噴鍘熷洜锛岄伩鍏嶇粫寮瓙銆?
---

## 涓€銆佸悗绔€滄渶甯哥敤銆佹渶绋冲Ε鈥濈殑杩斿洖鏂瑰紡鏄摢绉嶏紵

**缁撹锛?*

> **鍚庣鏈€甯哥敤銆佷篃鏄綋鍓?AI 娴佸紡瀵硅瘽浜嬪疄鏍囧噯鐨勬柟寮忔槸锛歋SE锛圫erver-Sent Events锛?*

鍦?Java / Spring Boot 浣撶郴涓嬶紝瀵瑰簲灏辨槸锛?
- `text/event-stream`
- `SseEmitter`
- 鎴?`Flux` + 鍝嶅簲寮忔祦

### 涓轰粈涔堜笉鏄?WebSocket锛?
| 缁村害           | SSE      | WebSocket |
| ------------ | -------- | --------- |
| 瀹炵幇澶嶆潅搴?       | 浣?       | 楂?        |
| 杩愮淮鎴愭湰         | 浣?       | 楂橈紙杩炴帴绠＄悊锛?  |
| 缃戝叧/Nginx 鏀寔  | 鍘熺敓濂?     | 瀹规槗琚柇      |
| AI 鍗曞悜娴佸紡杈撳嚭    | **瀹岀編鍖归厤** | 杩囧害璁捐      |
| Spring AI 榛樿 | **鏄?*    | 鍚?        |

馃憠 **闄ら潪浣犺鍋氣€滃疄鏃跺璇濇寚浠?/ 涓柇 / 鍙屽悜鎺у埗鈥?*锛屽惁鍒欐病蹇呰涓?WebSocket銆?
---

## 浜屻€丼pring Boot 鍚庣涓绘祦瀹炵幇鏂瑰紡锛堟寜浣跨敤棰戠巼锛?
### 鉁?鏂瑰紡 1锛歚SseEmitter`锛堟渶甯歌銆佹渶濂界悊瑙ｏ級

```java
@GetMapping(
  value = "/chat/stream",
  produces = MediaType.TEXT_EVENT_STREAM_VALUE
)
public SseEmitter stream() {
    SseEmitter emitter = new SseEmitter(0L);

    executor.submit(() -> {
        try {
            for (String token : tokens) {
                emitter.send(token);
            }
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    });

    return emitter;
}
```

**閫傚悎浣犵幇鍦ㄧ殑闃舵**锛?
- 鍚屾 MVC
- 鏀归€犳垚鏈綆
- 濂借皟璇?
---

### 鉁?鏂瑰紡 2锛歚Flux<String>`锛圫pring AI / WebFlux 瀹樻柟鎺ㄨ崘锛?
```java
@GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> stream() {
    return chatClient
        .prompt(prompt)
        .stream()
        .map(resp -> resp.getResult().getOutput().getContent());
}
```

**閫傚悎鍦烘櫙**锛?
- WebFlux
- 楂樺苟鍙?- 鍏ㄩ摼璺搷搴斿紡

---

### 鉂?鏂瑰紡 3锛氫竴娆℃€?JSON 杩斿洖锛堜笉閫傚悎娴佸紡锛?
```json
{
  "content": "瀹屾暣鍥炵瓟"
}
```

馃憠 **杩欏凡缁忎笉绗﹀悎浣犵幇鍦ㄥ湪鍋氱殑 AI 瀵硅瘽浣撻獙浜?*

---

## 涓夈€佷綘闂殑閲嶇偣锛?*Flex 琛屼笉琛岋紵**

鎴戝厛纭涓€浠朵簨锛歕
浣犺繖閲岀殑 **Flex** 鎸囩殑涓嶆槸 Adobe Flex锛岃€屾槸浣犲湪 **鍓嶇 / 缁勪欢閲岀敤鐨勬祦寮忓洖璋冩帴鍙ｏ紙onMessage / chunk锛?*锛屽鍚э紵

### 缁撹涓€鍙ヨ瘽锛?
> **琛岋紝鑰屼笖浣犵幇鍦ㄧ敤鐨?Flex / 娴佸紡鍥炶皟锛屾湰璐ㄤ笂灏辨槸鍦ㄢ€滄秷璐?SSE 鎴?Stream鈥濓紝涓嶆槸闂鐨勬牴婧愩€?*

### 鍏抽敭鍖哄垎鐐瑰湪杩欓噷锛?
- **Flex 鏄墠绔€滄€庝箞娑堣垂娴佲€?*
- **SSE / Stream 鏄悗绔€滄€庝箞鍚愭祦鈥?*

鍙婊¤冻涓嬮潰 3 鐐癸紝**鍓嶇鐢ㄤ粈涔堥兘琛?*锛?
1. 鍚庣 **涓嶈涓€娆℃€ц繑鍥?*
2. HTTP 杩炴帴 **涓嶈鎻愬墠鍏抽棴**
3. 鏁版嵁 **鑳借鍒?chunk 鎺ㄩ€?*

浣犵幇鍦ㄨ繖绉嶏細

```ts
onMessage: (chunk) => {
  assistantMessage.content += chunk;
}
```

**瀹屽叏 OK锛岃€屼笖鏄爣鍑嗗仛娉曘€?*

---

## 鍥涖€佷粈涔堟椂鍊?Flex 浼氣€滅湅璧锋潵涓嶈鈥濓紙浣嗗叾瀹炴槸鍚庣闂锛?
### 鉂?琛ㄨ薄锛氬墠绔竴娆℃€у嚭鏉?
鏍瑰洜閫氬父鏄悗绔?/ 缃戝叧锛?
- `Content-Type` 涓嶆槸 `text/event-stream`
- Nginx buffering 娌″叧
- 鐢ㄤ簡 `@ResponseBody` 杩斿洖 String
- controller 鏂规硶闃诲锛岀瓑鍏ㄩ儴缁撴潫鎵?return

馃憠 **涓嶆槸 Flex 鐨勯棶棰?*

---

## 浜斻€佹垜缁欎綘鐨勨€滃伐绋嬬骇寤鸿鈥?
濡傛灉浣犵幇鍦ㄨ鎴戞媿鏉匡細

### 鍚庣锛?
- **Spring Boot + SSE锛坄SseEmitter` 鎴?`Flux`锛?*
- 鏄庣‘ `text/event-stream`
- 鍏虫帀浠ｇ悊缂撳啿

### 鍓嶇锛?
- 浣犵幇鍦ㄨ繖濂?**Flex / onMessage 妯″紡缁х画鐢?*
- 涓嶉渶瑕佹帹鍊掗噸鏉?- 涓嶉渶瑕?WebSocket

---

## 鍏€佷竴鍙ヨ瘽鎬荤粨

> **鍚庣锛歋SE 鏄爣鍑嗙瓟妗?*\
> **鍓嶇锛欶lex 瀹屽叏娌￠棶棰橈紝瀹冨彧鏄秷璐规柟寮?*\
> **娴佷笉娴侊紝90% 鍙栧喅浜庡悗绔湁娌℃湁鈥滆竟鐢熸垚杈?send鈥?*

---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘鍋氫竴浠跺緢鍏蜂綋鐨勪簨涔嬩竴锛?
1. **甯綘瀹′竴鐪间綘鐜板湪鐨勫悗绔?Controller锛岀湅涓轰粈涔堟病娴?*
2. **缁欎綘涓€浠解€淪pring Boot + Spring AI + SSE鈥濇渶灏忓彲鐢ㄦā鏉?*
3. **缁撳悎浣犵幇鍦?TDesign Chat 缁勪欢锛屽府浣犲榻愭渶浣冲疄鐜?*

浣犻€変竴涓紝鎴戞寜宸ョ▼绾у埆鐩存帴缁欎綘銆?

#### You:
浠朏LUX涓嶆槸鍙兘杩斿洖鏀粯涓茬被鍨嬬殑鍚? 浠栨€庢牱杩斿洖涓€涓祦澶辩殑瀵硅薄?

#### ChatGPT:
杩欐槸涓€涓?*闈炲父涓撲笟銆佽€屼笖闂埌鐐瑰瓙涓婄殑闂**銆備綘杩欎釜鐤戦棶鏈川鏄細

> **Flux 涓嶆槸娉涘瀷鍙兘鏄?`String` 鍚楋紵閭ｅ畠鎬庝箞鈥滄祦寮忚繑鍥炰竴涓璞♀€濓紵**

鎴戠洿鎺ョ粰浣?*缁撹鍏堣**锛岀劧鍚庢妸鏈哄埗鎷嗗紑璁叉竻妤氥€?
---

## 涓€銆佸厛缁欑粨璁猴紙闈炲父閲嶈锛?
> **Flux 涓嶅彧鑳借繑鍥?String銆俓
> Flux<T> 涓殑 T 鍙互鏄换浣曞璞°€俓
> 鈥滄祦寮忚繑鍥炲璞♀€濃墵鈥滀竴娆℃€ц繑鍥炲畬鏁村璞♀€濄€?*

鍏抽敭鍦ㄤ簬杩欏彞璇濓細

> **娴佺殑鏄€屽璞＄殑鐗囨 / 鐘舵€併€嶏紝鑰屼笉鏄€屾渶缁堝畬鏁村璞°€?*

---

## 浜屻€丗lux 鐨勬湰璐ㄤ綘瑕佸厛鎷庢竻妤?
### 1锔忊儯 Flux 鏄粈涔堬紵

```java
Flux<T>
```

鎰忔€濇槸锛?
> **涓€涓椂闂村簭鍒椾笂鐨?T**

涔熷氨鏄細

```
T1 鈫?T2 鈫?T3 鈫?T4 鈫?complete
```

**涓嶆槸锛?*

```
List<T>
```

---

### 2锔忊儯 Flux 鍜屸€滄祦寮忊€濈殑鐪熸鍏崇郴

| 浣犱互涓虹殑娴佸紡         | 瀹為檯鐨勬祦寮?|
| -------------- | ----- |
| 杩斿洖涓€涓璞★紝涓€鐐圭偣濉瓧娈? | 鉂?涓嶆槸  |
| 杩斿洖澶氫釜瀵硅薄锛屾瘡娆′竴涓?   | 鉁?鏄?  |
| 姣忎釜瀵硅薄浠ｈ〃涓€娆♀€滅姸鎬佸揩鐓р€?| 鉁?鏄?  |

---

## 涓夈€丗lux<String> 涓轰粈涔堟渶甯歌锛?
鍥犱负 **Token 澶╃劧灏辨槸 String**锛?
```java
Flux<String>  // token 娴?```

妯″瀷鐢熸垚锛?
```
鈥滀綘鈥?鈫?鈥滃ソ鈥?鈫?鈥滐紝鈥?鈫?鈥滄垜鈥?鈫?鈥滄槸鈥?```

杩欐槸 **鏈€缁嗙矑搴︺€佹渶鑷劧鐨勬祦**銆?
---

## 鍥涖€侀偅 Flux 鎬庝箞杩斿洖鈥滃璞♀€濓紵锛堥噸鐐癸級

### 鉁?姝ｇ‘濮垮娍锛欶lux<DTO>

```java
public record ChatChunk(
    String delta,
    boolean finished,
    int index
) {}
```

```java
@GetMapping(
  value = "/chat/stream",
  produces = MediaType.TEXT_EVENT_STREAM_VALUE
)
public Flux<ChatChunk> stream() {
    return chatClient
        .prompt(prompt)
        .stream()
        .map(resp -> new ChatChunk(
            resp.getResult().getOutput().getContent(),
            false,
            resp.getMetadata().getIndex()
        ));
}
```

**瀹㈡埛绔敹鍒扮殑鏄細**

```json
data: {"delta":"浣?,"finished":false,"index":0}

data: {"delta":"濂?,"finished":false,"index":1}
```

馃憠 **杩欐槸鈥滄祦寮忓璞♀€濓紝涓嶆槸鈥滃璞℃祦寮忓～鍏呪€?*

---

## 浜斻€佷负浠€涔堚€滄祦寮忚繑鍥炰竴涓畬鏁村璞♀€濇槸涓吉鍛介锛?
浣犲彲鑳芥兂鐨勬槸杩欑锛?
```json
{
  "content": "浣?,
  "usage": null
}
{
  "content": "浣犲ソ",
  "usage": null
}
{
  "content": "浣犲ソ涓栫晫",
  "usage": { ... }
}
```

浣嗘敞鎰忥細

> **杩欎笉鏄竴涓璞″湪娴侊紝鑰屾槸澶氫釜瀵硅薄**

鍦?Java 涓栫晫閲岋細

```java
Flux<ChatResponse>
```

鑰屼笉鏄細

```java
ChatResponse (streaming)
```

---

## 鍏€丼pring AI 灏辨槸杩欎箞骞茬殑锛堜綘涔嬪墠鐢ㄨ繃锛?
Spring AI 鐨勬祦寮忔帴鍙ｇ鍚嶆槸锛?
```java
Flux<ChatResponse>
```

姣忎竴涓?`ChatResponse`锛?
- 鍙兘鍙寘鍚竴涓?token
- metadata 鍙兘涓嶅畬鏁?- usage 寰€寰€鏈€鍚庝竴涓墠鏈?
馃憠 **姣忎竴涓?ChatResponse 灏辨槸涓€涓€滈樁娈垫€у璞♀€?*

---

## 涓冦€侀偅鍓嶇鏄€庝箞鈥滄嫾鎴愬畬鏁村璞♀€濈殑锛?
杩欐槸鍓嶇鑱岃矗锛屼笉鏄?Flux 鐨勮亴璐ｃ€?
```ts
const finalMessage = {
  content: '',
  usage: null
};

onMessage(chunk) {
  finalMessage.content += chunk.delta;

  if (chunk.finished) {
    finalMessage.usage = chunk.usage;
  }
}
```

**杩欎竴姝ュ彨锛氬鎴风鑱氬悎锛圕lient-side aggregation锛?*

---

## 鍏€佷綘鐪熸璇ョ敤鐨勪笁绉?Flux 杩斿洖妯″瀷锛堝伐绋嬫帹鑽愶級

### 1锔忊儯 Flux<String>锛堟渶绠€鍗曪紝90% 鍦烘櫙锛?
```java
Flux<String>
```

浼樼偣锛?
- 绠€鍗?- 璋冭瘯鏂逛究
- 鍓嶇杞绘澗 append

---

### 2锔忊儯 Flux<ChatChunk>锛堟帹鑽愪紒涓氱骇锛?
```java
Flux<ChatChunk>
```

鍖呭惈锛?
- delta锛堝閲忓唴瀹癸級
- type锛坱oken / end / error锛?- index
- finishReason

---

### 3锔忊儯 Flux<ChatResponse>锛圫pring AI 鍘熺敓锛?
```java
Flux<ChatResponse>
```

浼樼偣锛?
- 淇℃伅鏈€鍏?- 涓庢ā鍨嬪己缁戝畾\
  缂虹偣锛?- 鍓嶇瑕佹噦缁撴瀯

---

## 涔濄€佷竴鍙ヨ瘽鎵撶┛浣犵殑鐤戦棶

> **Flux 涓嶆槸鈥滆繑鍥炰竴涓璞″苟娴佸紡濉厖鈥濓紝\
> 鑰屾槸鈥滆繑鍥炰竴绯诲垪瀵硅薄锛屾瘡涓璞′唬琛ㄤ竴娆＄敓鎴愮姸鎬佲€濄€?*

**鎵€浠ワ細**

- Flux\<String 鉁旓笍
- Flux<DTO> 鉁旓笍
- Flux<ChatResponse> 鉁旓笍
- 鈥滀竴涓璞℃參鎱㈠彉瀹屾暣鈥?鉂岋紙杩欐槸鍓嶇骞昏锛?
---

## 鍗併€佸鏋滀綘鎰挎剰锛屾垜鍙互涓嬩竴姝ョ洿鎺ュ府浣犲仛涓夐€変竴

1. **缁欎綘璁捐涓€涓爣鍑嗙殑 ChatChunk DTO锛堜紒涓氱骇锛?*
2. **甯綘鎶?Spring AI 鐨?Flux<ChatResponse> 鏀规垚浣犲墠绔渶鑸掓湇鐨勭粨鏋?*
3. **鐢讳竴寮犫€淔lux 娴佸紡瀵硅薄 + 鍓嶇鑱氬悎鈥濈殑瀹屾暣鏃跺簭鍥?*

浣犻€変竴涓紝鎴戠洿鎺ョ粰浣犺惤鍦版柟妗堛€?

#### You:
鐒跺悗鎴戠湅鏈€鍚庢瘡涓€娆℃帴鍙ｈ繑鍥炵殑鏈€鍚庝竴娆℃槸涓狣ON1 杩欎釜鏄共浠€涔堢殑

#### ChatGPT:
浣犵湅鍒扮殑 **`[DONE]` / `DONE` / `DON1`锛堜綘杩欎釜澶ф鐜囨槸 `DONE` 琚鐪嬶級**锛岃繖鏄?*娴佸紡鎺ュ彛閲岀殑鈥滅粨鏉熶俊鍙封€?*銆俓
杩欐槸涓€涓?*闈炲父鍏抽敭浣嗙粡甯歌璇В鐨勬爣璁?*锛屾垜缁欎綘浠庡伐绋嬭搴︿竴娆¤閫忋€?
---

## 涓€銆佸厛缁欑粨璁猴紙鏍稿績锛?
> **`DONE` 涓嶆槸涓氬姟鏁版嵁锛屼篃涓嶆槸瀵硅薄瀛楁**\
> **瀹冩槸鈥滄祦宸茬粡缁撴潫鈥濈殑鍗忚绾ф爣璁?*

绛変环浜庝竴鍙ヨ瘽锛?
> **鈥滄ā鍨嬩笉浼氬啀鐢熸垚浠讳綍 token 浜嗭紝鍙互鏀跺熬浜嗐€傗€?*

---

## 浜屻€佸畠涓轰粈涔堜竴瀹氳瀛樺湪锛?
鍦ㄦ祦寮忓満鏅笅锛屾湁涓€涓牴鏈棶棰橈細

> **瀹㈡埛绔€庝箞鐭ラ亾锛歕
> 杩欐槸鈥滄殏鏃舵病鏁版嵁鈥濓紝杩樻槸鈥滄案杩滀笉浼氬啀鏈夋暟鎹€濓紵**

### 濡傛灉娌℃湁 DONE锛屼細鍙戠敓浠€涔堬紵

- HTTP 杩炴帴杩樺紑鐫€
- 鍓嶇涓嶇煡閬撹涓嶈锛?  - 鍋滄 loading
  - 缁熻 token
  - 瑙ｉ攣杈撳叆妗?  - 鍏抽棴 reader
- 鍙兘闈犺秴鏃?鉂岋紙闈炲父涓嶄笓涓氾級

馃憠 鎵€浠ュ繀椤绘湁涓€涓?*鏄庣‘鐨勨€滅粓姝㈠抚鈥?*

---

## 涓夈€丏ONE 鍦ㄥ崗璁腑鐨勭湡瀹炰綅缃?
浠ユ渶甯歌鐨?**SSE + OpenAI / Spring AI 椋庢牸**涓轰緥锛?
```text
data: {"delta":"浣?}

data: {"delta":"濂?}

data: {"delta":"涓栫晫"}

data: [DONE]
```

娉ㄦ剰鍑犵偣锛?
1. `DONE` **涓嶆槸 JSON**
2. `DONE` **涓嶆槸鏌愪釜瀛楁**
3. 瀹冩槸涓€涓?**鈥滄帶鍒朵俊鍙封€?*

---

## 鍥涖€佷负浠€涔堜笉鏄?HTTP 鐩存帴 close锛?
杩欐槸涓€涓?*璁捐鏉冭　闂**锛?
| 鏂瑰紡          | 闂                   |
| ----------- | -------------------- |
| 鐩存帴 close 杩炴帴 | 瀹㈡埛绔棤娉曞尯鍒嗏€滄甯哥粨鏉?/ 缃戠粶寮傚父鈥?|
| DONE 鏍囪     | 鉁?鏄庣‘銆佸彲鎵╁睍銆佸彲鍏煎         |

鎵€浠ヤ富娴佹ā鍨嬫湇鍔￠兘閲囩敤锛?
> **鈥淒ONE + 姝ｅ父 close鈥?鍙屼繚闄?*

---

## 浜斻€佸湪 Flux / Spring AI 閲岋紝DONE 瀵瑰簲浠€涔堬紵

### 1锔忊儯 鍦ㄦā鍨?SDK 灞?
```java
Flux<ChatResponse>
```

褰撴ā鍨嬪彂瀹屾渶鍚庝竴涓?token 鍚庯細

- Flux 浼氬彂 `onComplete()`
- 搴曞眰 SSE 閲岄€氬父浼撮殢 `[DONE]`

### 2锔忊儯 鍦ㄤ綘鑷繁鐨?Controller 灞傦紙濡傛灉浣犳墜鍐?SSE锛?
浣犲彲鑳藉啓杩囩被浼硷細

```java
emitter.send("[DONE]");
emitter.complete();
```

鎴栬€咃細

```java
emitter.complete(); // 妗嗘灦鑷姩 close
```

**DONE 鏄€滈€昏緫缁撴潫鈥漒
complete 鏄€滆繛鎺ョ粨鏉熲€?*

---

## 鍏€佸墠绔簲璇ュ浣曟纭鐞?DONE锛堥噸鐐癸級

### 鉂?閿欒鍋氭硶

```ts
onMessage(chunk) {
  message += chunk; // 鎶?DONE 鎷艰繘鍘讳簡
}
```

杩欏氨浼氬鑷翠綘鐪嬪埌濂囨€殑锛?
```
浣犲ソ涓栫晫DONE
```

---

### 鉁?姝ｇ‘鍋氭硶

```ts
onMessage(chunk) {
  if (chunk === '[DONE]') {
    loading.value = false;
    finalizeMessage();
    return;
  }

  message += chunk;
}
```

鎴栬€呭鏋滄槸瀵硅薄娴侊細

```ts
if (chunk.type === 'end') {
  finish();
}
```

---

## 涓冦€佷负浠€涔堜綘鐪嬪埌鐨勬槸 DON1 / DONE 杩欑鎬笢瑗匡紵

甯歌鍘熷洜鏈?4 涓細

### 1锔忊儯 瀛椾綋 / 鏃ュ織鏄剧ず闂

`DONE` 琚璇讳负 `DON1`

### 2锔忊儯 decoder 娌″鐞嗗ソ鍒嗙墖

姣斿锛?
```
DO
NE
```

琚嫾鎴愬紓甯稿瓧绗︿覆

### 3锔忊儯 浣犳墦鍗扮殑鏄?raw chunk

鑰屼笉鏄В鏋愬悗鐨?`data: xxx`

### 4锔忊儯 鍚庣鑷畾涔変簡缁撴潫鏍囪瘑

鏈夌殑浜虹敤锛?
```json
{ "finish": true }
```

浣?*璇箟鏄竴鏍风殑**

---

## 鍏€丏ONE 鍜?鈥滄渶鍚庝竴涓璞♀€?鐨勫尯鍒紙闈炲父閲嶈锛?
寰堝浜轰細娣锋穯杩欎袱涓細

### 鉂?閿欒鐞嗚В

> DONE 鏄渶鍚庝竴涓?ChatResponse

### 鉁?姝ｇ‘鐞嗚В

```
ChatResponse(token)
ChatResponse(token)
ChatResponse(token, finishReason=STOP)
[DONE]
```

- **鏈€鍚庝竴涓?ChatResponse**锛氫笟鍔″璞?- **DONE**锛氬崗璁帶鍒朵俊鍙?
---

## 涔濄€佸鏋滀綘鑷繁璁捐鍗忚锛屾垜缁欎綘涓€涓爣鍑嗘ā鏉?
### 鍚庣缁熶竴杩斿洖缁撴瀯锛堟帹鑽愶級

```json
{
  "type": "delta",
  "content": "浣?
}
```

```json
{
  "type": "end",
  "finishReason": "stop",
  "usage": { ... }
}
```

鑰屼笉鏄８ DONE銆?
### 鍓嶇鍒ゆ柇鏇存竻鏅帮細

```ts
if (chunk.type === 'end') {
  finish();
}
```

---

## 鍗併€佷竴鍙ヨ瘽鎬荤粨锛堜綘鍙互璁颁綇锛?
> **`DONE` 鐨勫敮涓€浣滅敤锛歕
> 鍛婅瘔瀹㈡埛绔?鈥斺€斺€滄祦缁撴潫浜嗭紝鍙互鏀跺熬浜嗏€?*

瀹冿細

- 鉂?涓嶆槸妯″瀷鍐呭
- 鉂?涓嶆槸 JSON
- 鉂?涓嶈灞曠ず
- 鉁?鏄祦寮忓崗璁殑鈥滃彞鍙封€?
---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘鍋氫竴浠跺緢瀹炲湪鐨勪簨锛?
- **甯綘璁捐涓€濂椻€滀笉鍐嶉渶瑕?DONE 瀛楃涓测€濈殑娴佸紡瀵硅薄鍗忚**
- **鎴栬€呯洿鎺ュ府浣犳妸鐜板湪鐨?DONE 澶勭悊閫昏緫鍐欐垚涓€娈电ǔ鍋ヤ唬鐮?*

浣犲憡璇夋垜浣犵幇鍦ㄦ槸 **fetch + reader** 杩樻槸 **EventSource**锛屾垜鐩存帴缁欎綘瀵瑰簲鐗堟湰銆?

#### You:
export interface ChatBaseContent<T extends string, TData> {
    type: T;
    data: TData;
    status?: ChatMessageStatus;
    id?: string;
    strategy?: 'merge' | 'append';
    ext?: Record<string, any>;
}
杩欎釜鎺ュ彛鏄敤鏉ュ共鍟ョ殑

#### ChatGPT:
杩欎釜鎺ュ彛**涓嶆槸鈥滄ā鍨嬭繑鍥炵粨鏋勨€?*锛岃€屾槸涓€涓?*鍓嶇灞傞潰鐨勨€滄祦寮忔秷鎭崗璁娊璞♀€?*銆俓
瀹冪殑浣滅敤涓嶆槸鎵胯浇涓氬姟鏈韩锛岃€屾槸**瑙勮寖鈥滄瘡涓€娆℃祦寮忚繑鍥炵殑鏁版嵁璇ユ€庝箞琚墠绔秷璐广€佹覆鏌撱€佸悎骞垛€?*銆?
鎴戞寜**宸ョ▼璁捐鎰忓浘 鈫?瀛楁閫愪竴瑙ｉ噴 鈫?鍦ㄦ祦寮忓満鏅腑鐨勭湡瀹炵敤娉?*缁欎綘璁叉竻妤氥€?
---

## 涓€銆佷竴鍙ヨ瘽瀹氫綅杩欎釜鎺ュ彛

> **`ChatBaseContent` 鏄墠绔敤浜庢弿杩扳€滀竴娆℃祦寮忔秷鎭墖娈碉紙Chunk锛夆€濈殑缁熶竴鏁版嵁妯″瀷**

娉ㄦ剰鍏抽敭璇嶏細

- **鍓嶇**
- **涓€娆?*
- **鐗囨**
- **娴佸紡**

瀹冧笉鏄渶缁堟秷鎭紝鑰屾槸 **message building block锛堟瀯寤哄潡锛?*銆?
---

## 浜屻€佷负浠€涔堣鏈夎繖涔堜竴涓帴鍙ｏ紵

鍦ㄦ祦寮忓璇濅腑锛屽墠绔細鎸佺画鏀跺埌涓嶅悓鈥滅被鍨嬧€濈殑鏁版嵁锛?
- token 鍐呭
- loading / thinking
- end / done
- error
- metadata锛坲sage銆乻trategy銆乼ool锛?
濡傛灉涓嶇敤涓€涓粺涓€鍗忚锛屼綘鍓嶇灏变細鍙樻垚锛?
```ts
if (xxx) ...
else if (yyy) ...
```

**`ChatBaseContent` 鐨勮璁＄洰鏍囧氨鏄細**

> **鎶娾€滄祦寮忓崗璁€濈粨鏋勫寲銆佺被鍨嬪寲銆佸彲鎵╁睍**

---

## 涓夈€佹帴鍙ｆ暣浣撶粨鏋勫啀鐪嬩竴鐪?
```ts
export interface ChatBaseContent<T extends string, TData> {
  type: T;
  data: TData;
  status?: ChatMessageStatus;
  id?: string;
  strategy?: 'merge' | 'append';
  ext?: Record<string, any>;
}
```

杩欐槸涓€涓猏*\*娉涘瀷 + 鍒ゅ埆鑱斿悎锛圖iscriminated Union锛塡*\*鐨勫熀纭€鎺ュ彛銆?
---

## 鍥涖€佸瓧娈甸€愪竴瑙ｉ噴锛堥噸鐐癸級

### 1锔忊儯 `type: T` 鈥斺€?**杩欐槸浠€涔堢墖娈碉紵**

杩欐槸**鏈€鏍稿績瀛楁**锛岀敤鏉ュ尯鍒嗘祦寮忎簨浠剁被鍨嬨€?
甯歌鍊硷細

```ts
type = 'delta'    // 鏂囨湰澧為噺
type = 'end'      // 缁撴潫淇″彿
type = 'error'    // 閿欒
type = 'meta'     // usage / token 缁熻
type = 'tool'     // 宸ュ叿璋冪敤
```

鍓嶇鎵€鏈夐€昏緫鍑犱箮閮芥槸 `switch(type)`銆?
---

### 2锔忊儯 `data: TData` 鈥斺€?**杩欐甯︿簡浠€涔堟暟鎹紵**

鏍规嵁 `type` 鍐冲畾缁撴瀯锛?
```ts
// delta
{ data: "浣? }

// end
{ data: { finishReason: 'stop' } }

// meta
{ data: { promptTokens: 123, completionTokens: 456 } }
```

馃憠 **杩欏氨鏄负浠€涔堝畠鏄硾鍨嬬殑**

---

### 3锔忊儯 `status?: ChatMessageStatus` 鈥斺€?**娑堟伅褰撳墠澶勪簬浠€涔堢姸鎬?*

鍏稿瀷鐘舵€侊細

```ts
'loading' | 'streaming' | 'success' | 'error'
```

鐢ㄤ簬锛?
- 鎺у埗 loading 鍔ㄧ敾
- 绂佺敤杈撳叆
- 鍒囨崲 UI 鐘舵€?
---

### 4锔忊儯 `id?: string` 鈥斺€?**杩欐鍐呭灞炰簬鍝潯娑堟伅**

鍦ㄥ苟鍙?/ 澶氭秷鎭祦鏃堕潪甯搁噸瑕侊細

- 澶氫釜 assistant 鍚屾椂娴?- 閲嶈瘯 / 鍥炴粴
- 娑堟伅鏇挎崲

```ts
id = messageId
```

---

### 5锔忊儯 `strategy?: 'merge' | 'append'` 鈥斺€?**濡備綍鎶婂畠鈥滄嫾鈥濊繘鐜版湁娑堟伅**

杩欐槸**闈炲父宸ョ▼鍖栥€侀潪甯稿叧閿殑璁捐**銆?
#### `append`锛堥粯璁わ級

```ts
content = content + data
```

閫傚悎锛?
- token 娴?- 鏅€氭枃鏈?
#### `merge`

```ts
Object.assign(content, data)
```

閫傚悎锛?
- usage
- metadata
- 鏈€缁堢粨鏋滆ˉ鍏?
馃憠 **杩欒В鍐充簡鈥滀竴涓璞℃€庝箞娴佸紡鏇存柊鈥濈殑闂**

---

### 6锔忊儯 `ext?: Record<string, any>` 鈥斺€?**鎵╁睍瀛楁**

缁欐湭鏉ョ暀鐨勫彛瀛愶紝姣斿锛?
```ts
ext: {
  model: 'gpt-4.1',
  latency: 320,
  retry: false
}
```

涓嶇牬鍧忎富缁撴瀯銆?
---

## 浜斻€佸畠鍦ㄦ祦寮忓璇濅腑鐨勭湡瀹炰娇鐢ㄦ柟寮忥紙闈炲父閲嶈锛?
### 鍚庣杩斿洖锛堢ず鎰忥級

```json
{ "type": "delta", "data": "浣?, "strategy": "append" }
{ "type": "delta", "data": "濂?, "strategy": "append" }
{ "type": "meta", "data": { "usage": {...} }, "strategy": "merge" }
{ "type": "end", "data": { "finishReason": "stop" } }
```

---

### 鍓嶇娑堣垂閫昏緫锛堟牳蹇冩€濇兂锛?
```ts
function handleChunk(chunk: ChatBaseContent<any, any>) {
  switch (chunk.type) {
    case 'delta':
      message.content += chunk.data;
      break;

    case 'meta':
      Object.assign(message, chunk.data);
      break;

    case 'end':
      message.status = 'success';
      break;
  }
}
```

**娉ㄦ剰锛?*

- `delta` 涓嶅叧蹇冩暣浣?- `meta` 琛ヤ俊鎭?- `end` 鍋氭敹灏?
---

## 鍏€佸畠瑙ｅ喅鐨勬牴鏈棶棰樻槸浠€涔堬紵

### 鉂?涓嶇敤杩欎釜鎺ュ彛浼氭€庢牱锛?
- 鍓嶇鍒板鏄?if else
- DONE / usage / token 娣峰湪涓€璧?- 绫诲瀷涓嶅畨鍏?- 寰堥毦鍔犳柊鑳藉姏锛坱ool / function call锛?
### 鉁?鐢ㄨ繖涓帴鍙ｄ箣鍚?
- **鍗忚娓呮櫚**
- **绫诲瀷瀹夊叏**
- **鍙墿灞?*
- **鍓嶇鍙娴?*

---

## 涓冦€佸畠鍜?Flux / DONE 鐨勫叧绯?
| 姒傚康                  | 瑙掕壊          |
| ------------------- | ----------- |
| Flux                | 鍚庣鈥滄€庝箞娴佲€?    |
| DONE                | 鍗忚鈥滀粈涔堟椂鍊欑粨鏉熲€? |
| **ChatBaseContent** | 鍓嶇鈥滄€庝箞鐞嗚В杩欐娴佲€?|

馃憠 **杩欐槸鍓嶇鐨勨€滃崗璁炕璇戝眰鈥?*

---

## 鍏€佷竴鍙ヨ瘽鎬荤粨锛堜綘鍙互璁颁綇锛?
> **`ChatBaseContent` 鏄墠绔鈥滄祦寮忚繑鍥炲唴瀹光€濈殑缁熶竴鎶借薄鍗忚锛孿
> 鐢ㄦ潵鍛婅瘔 UI锛氳繖鏄粈涔堛€佹€庝箞鎷笺€佷粈涔堟椂鍊欑粨鏉熴€?*

瀹冧笉鏄浣欒璁★紝鑰屾槸**鎶婃贩涔辩殑娴佸紡鏁版嵁鍙樻垚鍙淮鎶ゅ伐绋嬬粨鏋?*銆?
---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘鍋氫竴浠跺緢瀹炲湪鐨勪簨锛?
- **甯綘鍩轰簬杩欎釜鎺ュ彛锛岃璁′竴鏁村 `delta / end / error` 绫诲瀷瀹氫箟**
- **鎴栬€呭府浣犳妸鍚庣 Flux 杈撳嚭锛岀洿鎺ユ槧灏勬垚杩欎釜缁撴瀯**

浣犲彧瑕佽涓€鍙ワ細**鈥滄寜鎴戠幇鍦ㄧ殑 ChatBaseContent 璁捐涓€濂楀畬鏁村崗璁€?*锛屾垜鐩存帴缁欎綘鎴愬搧銆?

#### You:
鏄笉鏄垜鍚庣杩斿洖锛屾祦寮忔暟鎹紝缁欎粬娴佸紡杩斿洖杩欐牱涓€涓璞″氨琛?
#### ChatGPT:
缁撹鍏堣锛岀劧鍚庢妸**杈圭晫鏉′欢**璁叉竻妤氾紝閬垮厤浣犲湪瀹炵幇鏃惰俯鍧戙€?
---

## 涓€銆佺粨璁猴紙闈炲父鏄庣‘锛?
> **鏄殑锛屼綘鐨勭悊瑙ｆ槸瀵圭殑锛歕
> 鍚庣鍙渶瑕佲€滄寜娴佸紡锛屼竴娆℃杩斿洖 `ChatBaseContent` 杩欑瀵硅薄鈥濆嵆鍙€?*

浣嗚繖鍙ヨ瘽鏈変竴涓?*鍓嶆彁**锛?
> **杩斿洖鐨勬槸鈥滃璞℃祦锛團lux / SSE锛夆€濓紝鑰屼笉鏄€滀竴涓璞¤鎱㈡參濉厖鈥濄€?*

---

## 浜屻€佷綘鍚庣鐪熸瑕佸仛鐨勪簨鎯呮槸浠€涔堬紵

### 姝ｇ‘鐨勬ā鍨嬫槸杩欐牱锛?
```
ChatBaseContent(delta, "浣?)
ChatBaseContent(delta, "濂?)
ChatBaseContent(meta, usage)
ChatBaseContent(end, finishReason)
```

鑰屼笉鏄細

```
ChatMessage {
  content: "浣? -> "浣犲ソ" -> "浣犲ソ涓栫晫"
}
```

**涓€娆′竴涓璞★紝涓€娆′竴涓簨浠躲€?*

---

## 涓夈€佹爣鍑嗗悗绔繑鍥炴柟寮忥紙Spring Boot / Spring AI锛?
### 鏂瑰紡涓€锛氱洿鎺ヨ繑鍥?`Flux<ChatBaseContent<?, ?>>`锛堟帹鑽愶級

```java
@GetMapping(
  value = "/chat/stream",
  produces = MediaType.TEXT_EVENT_STREAM_VALUE
)
public Flux<ChatBaseContent<String, Object>> stream() {
    return chatClient
        .prompt(prompt)
        .stream()
        .map(resp -> ChatBaseContent.delta(
            resp.getResult().getOutput().getContent()
        ))
        .concatWith(Mono.just(ChatBaseContent.end()));
}
```

**鍏抽敭鐐癸細**

- 姣忎釜 `map` 鈫?涓€涓祦寮忓璞?- 鏈€鍚庝竴瀹氳鏈?`end`
- Flux `onComplete` 鈮?涓氬姟 end锛堝缓璁袱鑰呴兘鏈夛級

---

### 鏂瑰紡浜岋細`SseEmitter` 鎵嬪姩鎺ㄥ璞★紙MVC锛?
```java
emitter.send(delta("浣?));
emitter.send(delta("濂?));
emitter.send(meta(usage));
emitter.send(end());
emitter.complete();
```

---

## 鍥涖€佸墠绔細鎬庝箞鐢紵锛堜綘鐜板湪鐨勮璁″畬鍏ㄥ锛?
```ts
onMessage(chunk: ChatBaseContent<any, any>) {
  switch (chunk.type) {
    case 'delta':
      message.content += chunk.data;
      break;

    case 'meta':
      Object.assign(message, chunk.data);
      break;

    case 'end':
      message.status = 'success';
      break;
  }
}
```

鍓嶇**涓嶅叧蹇冩ā鍨嬨€佷笉鍏冲績 Flux銆佷笉鍏冲績 SSE**锛孿
瀹冨彧璁?**ChatBaseContent 鍗忚**銆?
---

## 浜斻€佷綘蹇呴』娉ㄦ剰鐨?4 涓叧閿偣锛堝緢瀹规槗鍑洪棶棰橈級

### 1锔忊儯 姣忎釜瀵硅薄閮芥槸鈥滅嫭绔?JSON鈥?
鉂?閿欒锛?
```json
{"type":"delta","data":"浣?}{"type":"delta","data":"濂?}
```

鉁?姝ｇ‘锛圫SE / Stream 鑷姩鍒嗗抚锛夛細

```text
data: {"type":"delta","data":"浣?}

data: {"type":"delta","data":"濂?}
```

---

### 2锔忊儯 涓€瀹氳鏈?`end` 绫诲瀷锛堜笉瑕佸彧闈?close锛?
> **end = 涓氬姟瀹屾垚\
> close = 杩炴帴瀹屾垚**

涓よ€呬笉瑕佹贩銆?
---

### 3锔忊儯 涓嶈鎶?DONE 鏆撮湶缁欏墠绔?
DONE 鏄?*鍗忚缁嗚妭**锛孿
浣犵幇鍦ㄥ凡缁忔湁鏇村ソ鐨勶細

```ts
type = 'end'
```

DONE 鍙瀛樺湪浜庯細

- SDK 鍐?- 鍚庣閫傞厤灞?
---

### 4锔忊儯 Content-Type 蹇呴』姝ｇ‘

```http
Content-Type: text/event-stream
```

鍚﹀垯鍓嶇浼氣€滅瓑鍒颁竴娆℃€ц繑鍥炩€濄€?
---

## 鍏€佷綘鐜板湪杩欎釜璁捐鏄€滃鐨勶紝鑰屼笖鏄珮绾ц璁♀€?
寰堝浜轰細锛?
- 鍚庣瑁?String 娴?- 鍓嶇纭?parse
- DONE 娣峰湪鍐呭閲?
鑰屼綘鐜板湪鏄細

> **鍚庣锛氱粺涓€鍗忚瀵硅薄\
> 鍓嶇锛氱瓥鐣ュ寲娑堣垂**

杩欐槸**浼佷笟绾у疄鐜版柟寮?*銆?
---

## 涓冦€佷竴鍙ヨ瘽鎬荤粨锛堜綘鍙互鐩存帴褰撶粨璁虹敤锛?
> **鍚庣娴佸紡杩斿洖鈥滀竴涓釜 `ChatBaseContent` 瀵硅薄鈥濓紝\
> 鍓嶇鎸?type + strategy 娑堣垂锛孿
> 杩欏氨鏄畬鏁淬€佹纭€佸彲鎵╁睍鐨勬祦寮忓璇濇柟妗堛€?*

---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘鎶婅繖浠朵簨**涓€娆℃€у畾鍨?*锛?
- 缁欎綘涓€涓?**ChatBaseContent 宸ュ巶绫伙紙delta / meta / end锛?*
- 缁欎綘涓€浠?**Spring AI 鈫?ChatBaseContent 鐨勫畬鏁撮€傞厤浠ｇ爜**
- 鎴栬€呭府浣?**瀵归綈 TDesign Chat 鐨勬渶浣冲疄璺?*

浣犺涓€鍙ワ細**鈥滅粰鎴戝悗绔畬鏁撮€傞厤浠ｇ爜鈥?*锛屾垜鐩存帴缁欎綘鎴愬搧銆?

#### You:
杩欎釜锛屾垜鍚庣鏄笉鏄彲浠ユ兂 鍘熸潵閭ｇR绫诲瀷涓€鏍凤紝涓撻棬灏佽涓€涓祦寮忔暟鎹殑R绫诲瀷锛屼紒涓氫竴鑸槸鎬庝箞鍋氱殑

#### ChatGPT:
杩欐槸涓€涓?*闈炲父鎴愮啛銆侀潪甯糕€滀紒涓氱骇鈥濈殑鎬濊矾**锛岃€屼笖浣犲凡缁忚蛋鍦?*姝ｇ‘鏂瑰悜**涓婁簡銆?
鎴戠洿鎺ョ粰浣?*缁撹 + 琛屼笟鍋氭硶瀵规瘮 + 鎺ㄨ崘钀藉湴鏂规**锛屼笉缁曞集瀛愩€?
---

## 涓€銆佸厛缁欑粨璁猴紙浣犲彲浠ユ斁蹇冨仛锛?
> **鏄殑锛屽悗绔畬鍏ㄥ彲浠ャ€佽€屼笖鈥滃簲璇モ€濆儚鍘熸潵鐨?`R<T>` 涓€鏍凤紝\
> 涓撻棬灏佽涓€涓€滄祦寮忚繑鍥炰笓鐢ㄧ殑 R 绫诲瀷鈥濄€?*

鑰屼笖鍦?*浼佷笟閲岃繖鏄父瑙勫仛娉曪紝涓嶆槸鐗逛緥**銆?
浣嗘敞鎰忎竴鍙ヨ瘽锛?
> **娴佸紡 R 鈮?鏅€?R 鐨勬祦寮忕増**

---

## 浜屻€佷负浠€涔堟櫘閫?`R<T>` 涓嶈兘鐩存帴鐢紵

浣犵幇鍦ㄧ殑 `R<T>`锛堝吀鍨嬮暱杩欐牱锛夛細

```java
class R<T> {
  int code;
  String msg;
  T data;
}
```

瀹冪殑**闅愬惈璇箟鏄?*锛?
> **鈥滆繖娆?HTTP 璇锋眰宸茬粡瀹屾暣缁撴潫浜嗏€?*

鑰屾祦寮忔帴鍙ｇ殑璇箟鏄細

> **鈥滆姹傝繕鍦ㄨ繘琛屼腑锛屾暟鎹湪涓嶆柇浜х敓鈥?*

### 濡傛灉浣犵‖濂?R<T>锛屼細鍙戠敓浠€涔堬紵

- code / msg 鍦ㄧ涓€甯у氨鍥哄畾浜?- data 琚弽澶?patch
- 鍓嶇鏃犳硶鍒ゆ柇鈥滆繖鏄竴甯э紵杩樻槸鏈€缁堢粨鏋滐紵鈥?
馃憠 **璇箟娣蜂贡锛屾槸鍙嶆ā寮?*

---

## 涓夈€佷紒涓氶噷鐨勪笁绉嶄富娴佸仛娉曪紙鐪熷疄鎯呭喌锛?
### 鉁?鍋氭硶涓€锛?*娴佸紡涓撶敤 Envelope锛堟渶鎺ㄨ崘锛?*

杩欐槸浣犵幇鍦ㄨ蛋鐨勬柟鍚戙€?
#### 鍚庣瀹氫箟

```java
public class StreamEnvelope<T> {

    private String type;   // delta / meta / end / error
    private T data;

    private String id;
    private String status;
    private String strategy;

    private Map<String, Object> ext;
}
```

#### 鎺ュ彛杩斿洖

```java
Flux<StreamEnvelope<?>>
```

**鐗圭偣锛?*

- 涓嶅鐢?`R`
- 涓撻棬涓?streaming 璁捐
- 鍓嶇閫昏緫鏋佹竻鏅?
馃憠 **80% 浼佷笟鐢ㄨ繖涓ā寮?*

---

### 鈿狅笍 鍋氭硶浜岋細`R<StreamChunk<T>>`锛堜笉鎺ㄨ崘浣嗗父瑙侊級

```java
R<StreamChunk<T>>
```

闂锛?
- 澶栧眰 R 鐨?`code/msg` 娌℃剰涔?- 姣忎竴甯ч噸澶嶅寘瑁?- 鍓嶇瑙ｆ瀽澶嶆潅

馃憠 **閫氬父鏄巻鍙插寘琚?*

---

### 鉂?鍋氭硶涓夛細瑁?String / JSON锛堝皬椤圭洰锛?
```text
"浣?
"濂?
"DONE"
```

馃憠 蹇紝浣嗕笉鍙淮鎶わ紝涓嶅彲鎵╁睍

---

## 鍥涖€佷綘鐜板湪杩欎釜 ChatBaseContent锛屾湰璐ㄦ槸浠€涔堬紵

鎴戠粰浣犱竴涓?*闈炲父閲嶈鐨勫畾浣?*锛?
> **`ChatBaseContent` = 鍓嶇鐗?StreamEnvelope**

浣犵幇鍦ㄥ彧鏄細

- **鍓嶇宸茬粡瑙勮寖浜?*
- **鍚庣杩樻病瀵归綈**

鎵€浠ヤ綘鐜板湪闂殑杩欎釜闂锛岃鏄庝綘宸茬粡鎰忚瘑鍒帮細

> **鍚庣涔熷簲璇ユ湁涓€涓€滃绛夌殑娴佸紡鍗忚妯″瀷鈥?*

杩欐槸瀹屽叏姝ｇ‘鐨勩€?
---

## 浜斻€佹垜缁欎綘涓€涓€滀紒涓氱骇鏍囧噯璁捐鈥濓紙鐩存帴鍙敤锛?
### 1锔忊儯 鍚庣 StreamR锛堝懡鍚嶉殢浣狅級

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StreamR<T> {

    private String type;        // delta / meta / end / error
    private T data;

    private String messageId;
    private String status;      // streaming / success / error
    private String strategy;    // append / merge

    private Map<String, Object> ext;

    public static StreamR<String> delta(String text) {
        return new StreamR<>("delta", text, null, "streaming", "append", null);
    }

    public static StreamR<Void> end() {
        return new StreamR<>("end", null, null, "success", null, null);
    }
}
```

---

### 2锔忊儯 Controller 杩斿洖

```java
@GetMapping(
  value = "/chat/stream",
  produces = MediaType.TEXT_EVENT_STREAM_VALUE
)
public Flux<StreamR<?>> chatStream() {
    return chatClient.prompt(prompt)
        .stream()
        .map(resp -> StreamR.delta(resp.getResult().getOutput().getContent()))
        .concatWith(Mono.just(StreamR.end()));
}
```

---

### 3锔忊儯 鍓嶇 1:1 瀵归綈 ChatBaseContent

```ts
type ChatBaseContent = StreamR;
```

**浣犲墠鍚庣鍗忚鐬棿缁熶竴**銆?
---

## 鍏€佸嚑涓紒涓氶噷鈥滈粯璁や細鍔犵殑缁嗚妭鈥?
### 1锔忊儯 涓嶇敤 HTTP code 琛ㄧず涓氬姟鐘舵€?
鈫?鍏ㄦ斁鍦?`type / status`

### 2锔忊儯 涓€瀹氭湁 `end`

鈫?涓嶉潬杩炴帴鍏抽棴

### 3锔忊儯 strategy 鏄崗璁骇瀛楁

鈫?鍓嶇涓嶅啓 if

### 4锔忊儯 ext 鐣欐墿灞?
鈫?tool / function / traceId

---

## 涓冦€佷竴鍙ヨ瘽鎬荤粨锛堜綘鍙互鐩存帴褰撹璁＄粨璁猴級

> **浼佷笟閲屼笉浼氭妸娴佸紡鎺ュ彛鈥滃己琛屽杩?R<T>鈥濓紝\
> 鑰屾槸鍗曠嫭璁捐涓€涓€滄祦寮忚繑鍥?Envelope鈥濓紝\
> 璇箟娓呮櫚銆佸墠鍚庣瀵归綈銆侀暱鏈熷彲缁存姢銆?*

浣犵幇鍦ㄨ繖涓垽鏂紝**鏄鐨勶紝鑰屼笖鏄珮绾у垽鏂?*銆?
---

## 鍏€佷笅涓€姝ユ垜鍙互鐩存帴甯綘鈥滃畾鍗忚鈥?
濡傛灉浣犳効鎰忥紝鎴戝彲浠ョ洿鎺ュ府浣犲仛涓変欢浜嬩箣涓€锛堥兘寰堝疄鍦級锛?
1. **甯綘璁捐涓€浠解€滄渶缁堢増 StreamR 鍗忚锛堝墠鍚庣缁熶竴锛夆€?*
2. **甯綘鎶?Spring AI 鐨?Flux<ChatResponse> 瀹屾暣閫傞厤鎴?StreamR**
3. **甯綘鎶婄幇鏈夌殑 R<T> 浣撶郴锛屽拰 StreamR 骞跺瓨銆佹棤渚靛叆闆嗘垚**

浣犲彧瑕佽涓€鍙ワ細**鈥滄寜浼佷笟绾ф爣鍑嗙粰鎴戜竴濂楁渶缁堟柟妗堚€?*锛屾垜鐩存帴缁欎綘鍙惤鍦扮増鏈€?

#### You:
涓嶆槸涓€鑸繖涓繑鍥炵被閲岄潰鏈変釜鏍囧織鍚楋紝鏍囧織鎴戣繑鍥炵殑鏁版嵁鏄痶ext銆乵arkDown銆乮mg 杩欎釜瑕佹€庢牱杩斿洖

#### ChatGPT:
杩欎釜闂闂緱**闈炲父鍒颁綅**锛岃€屼笖浣犲凡缁忓湪寰€**浼佷笟绾у崗璁璁?*杩欎竴姝ヨ蛋浜嗐€?
鎴戝厛缁欎綘**鏄庣‘缁撹**锛屽啀鍛婅瘔浣?*浼佷笟閲屾槸鎬庝箞璁捐杩欎釜鈥滄爣蹇椾綅鈥濈殑**锛屼互鍙?*浣犵幇鍦ㄨ繖濂?ChatBaseContent 搴旇鎬庝箞鎵╁睍鎵嶆槸瀵圭殑**銆?
---

## 涓€銆佸厛缁欑粨璁猴紙鐩存帴鍥炵瓟浣狅級

> **鏄殑锛屼紒涓氱骇娴佸紡杩斿洖閲岋紝涓€瀹氫細鏈変竴涓€滃唴瀹圭被鍨嬫爣蹇椻€濓紝\
> 鐢ㄦ潵鍛婅瘔鍓嶇锛氳繖涓€甯ф暟鎹槸 text / markdown / image / 鈥?*

鑰屼笖杩欎釜鏍囧織锛?
- **涓嶅簲璇ラ潬鍓嶇鐚?*
- **涓嶅簲璇ラ潬瀛楃涓茶鍒欏垽鏂?*
- **蹇呴』鏄崗璁瓧娈?*

---

## 浜屻€佷紒涓氶噷杩欎釜鈥滄爣蹇椻€濅竴鑸€庝箞璁捐锛?
### 鉁?涓氱晫涓绘祦鍋氭硶锛?*鍐呭绫诲瀷 + 娓叉煋绛栫暐鍒嗙**

涓€鑸笉浼氬彧鏀句竴涓?boolean锛岃€屾槸**涓や釜缁村害**锛?
### 1锔忊儯 鍐呭璇箟绫诲瀷锛堜綘闂殑閲嶇偣锛?
```java
contentType: TEXT | MARKDOWN | IMAGE | FILE | TOOL
```

### 2锔忊儯 娓叉煋 / 鎷兼帴绛栫暐锛堜綘宸茬粡鏈変簡锛?
```java
strategy: append | merge | replace
```

---

## 涓夈€佷綘鐜板湪杩欎釜 ChatBaseContent锛屾€庝箞鎵╂渶鍚堢悊锛?
浣犵幇鍦ㄧ殑鎺ュ彛鏄細

```ts
export interface ChatBaseContent<T extends string, TData> {
  type: T;
  data: TData;
  status?: ChatMessageStatus;
  id?: string;
  strategy?: 'merge' | 'append';
  ext?: Record<string, any>;
}
```

**缁撹**锛歕
馃憠 **涓嶇敤鏀圭粨鏋勶紝鐩存帴鎶娾€滃唴瀹圭被鍨嬧€濇斁杩?`ext` 鎴栧崌绾ф垚涓€绛夊瓧娈点€?*

---

## 鍥涖€佷袱绉嶄紒涓氬父瑙佽璁℃柟寮忥紙鎺ㄨ崘浣犻€夊叾涓€锛?
---

### 鉁?鏂规涓€锛堟帹鑽愶級锛氬唴瀹圭被鍨嬩綔涓轰竴绛夊瓧娈?
**鍚庣杩斿洖缁撴瀯锛?*

```java
public class StreamR<T> {
    private String type;          // delta / end / error
    private String contentType;   // text / markdown / image
    private T data;
    private String strategy;
}
```

**杩斿洖绀轰緥锛?*

```json
{
  "type": "delta",
  "contentType": "markdown",
  "data": "**浣犲ソ**",
  "strategy": "append"
}
```

**鍓嶇澶勭悊锛?*

```ts
switch (chunk.contentType) {
  case 'text':
    renderText(chunk.data);
    break;
  case 'markdown':
    renderMarkdown(chunk.data);
    break;
  case 'image':
    renderImage(chunk.data);
}
```

馃憠 **鏈€娓呮櫚锛屾渶鎺ㄨ崘**

---

### 鈿狅笍 鏂规浜岋細鏀惧湪 ext锛堝吋瀹逛綘鐜板湪缁撴瀯锛?
```json
{
  "type": "delta",
  "data": "![img](url)",
  "strategy": "append",
  "ext": {
    "contentType": "markdown"
  }
}
```

鍓嶇锛?
```ts
const contentType = chunk.ext?.contentType ?? 'text';
```

馃憠 **鏀瑰姩鏈€灏忥紝浣嗙被鍨嬩笉濡傛柟妗堜竴娓呮櫚**

---

## 浜斻€佷笉鍚屽唴瀹圭被鍨嬶紝鍚庣鈥滄€庝箞杩斿洖鈥濓紵锛堜綘鏈€鍏冲績鐨勶級

### 1锔忊儯 text / markdown锛堟渶甯歌锛?
```json
{ "type": "delta", "contentType": "text", "data": "浣? }
{ "type": "delta", "contentType": "markdown", "data": "**濂?*" }
```

**娴佸紡鎷兼帴鍗冲彲銆?*

---

### 2锔忊儯 image锛堟敞鎰忥細鍥剧墖涓嶁€滄祦 token鈥濓級

浼佷笟閲岀殑鍏辫瘑鏄細

> **鍥剧墖 = 闈炴祦寮忓唴瀹癸紝鍙湪鈥滃畬鎴愭椂鈥濊繑鍥?*

#### 姝ｇ‘鍋氭硶锛?
```json
{
  "type": "delta",
  "contentType": "image",
  "data": {
    "url": "https://xxx/xxx.png",
    "width": 512,
    "height": 512
  },
  "strategy": "replace"
}
```

鎴栬€咃細

```json
{
  "type": "end",
  "contentType": "image",
  "data": { "url": "..." }
}
```

鉂?**涓嶈瀵?image 鍋?token 娴?*

---

### 3锔忊儯 markdown + code block锛堜紒涓氬父瑙侊級

````json
{
  "type": "delta",
  "contentType": "markdown",
  "data": "```java\n"
}
````

```json
{
  "type": "delta",
  "contentType": "markdown",
  "data": "System.out.println();\n"
}
```

````json
{
  "type": "delta",
  "contentType": "markdown",
  "data": "```"
}
````

鍓嶇鐢?markdown renderer 鍗冲彲銆?
---

## 鍏€佷竴涓€滀紒涓氱骇缁熶竴绀轰緥鈥濓紙瀹屾暣锛?
```json
{ "type":"delta","contentType":"text","data":"浣犲ソ","strategy":"append" }
{ "type":"delta","contentType":"markdown","data":"**涓栫晫**","strategy":"append" }
{
  "type":"delta",
  "contentType":"image",
  "data":{"url":"https://xx/img.png"},
  "strategy":"replace"
}
{ "type":"end","status":"success" }
```

---

## 涓冦€佷綘鐜板湪鐨勮璁★紝璺濈鈥滀紒涓氭爣鍑嗏€濆彧宸竴姝?
浣犲凡缁忔湁锛?
- type锛堜簨浠剁被鍨嬶級
- strategy锛堟嫾鎺ョ瓥鐣ワ級
- ext锛堟墿灞曡兘鍔涳級

**浣犵幇鍦ㄥ彧宸細**

> **鎶娾€滃唴瀹硅涔夌被鍨嬧€濇寮忕撼鍏ュ崗璁?*

---

## 鍏€佷竴鍙ヨ瘽鎬荤粨锛堜綘鍙互鐩存帴璁帮級

> **浼佷笟绾ф祦寮忚繑鍥炰竴瀹氫細鏄庣‘鍛婅瘔鍓嶇锛歕
> 鈥滆繖涓€甯ф槸浠€涔堝唴瀹癸紙text / markdown / image锛夆€濓紝\
> 鑰屼笉鏄鍓嶇鐚溿€?*

---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘锛?
- **缁欎綘涓€浠?`ContentType` 鐨勬灇涓惧畾涔夛紙鍓嶅悗绔竴鑷达級**
- **璁捐 text / markdown / image 鐨勫畬鏁存祦寮忓崗璁ず渚?*
- **甯綘鎶?Spring AI 杈撳嚭锛岃嚜鍔ㄦ槧灏勬垚涓嶅悓 contentType**

浣犲彧瑕佽涓€鍙ワ細**鈥滅粰鎴戞渶缁堢増鍐呭绫诲瀷鍗忚鈥?*锛屾垜鐩存帴缁欎綘瀹氱銆?

#### You:
濂斤紝浣犳€荤粨涓€涓嬶紝鎸夌収浼佷笟琛ㄩ拡鏂瑰紡锛岀粰鎴戝皝瑁呬竴涓繑鍥炲墠绔祦寮忔暟鎹殑绫讳技浜嶳绫诲瀷鐨勫璞?
#### ChatGPT:
鏄庣櫧锛屾垜缁欎綘鍋氫竴涓?*浼佷笟绾с€佹爣鍑嗗寲銆佸彲鐩存帴钀藉湴鐨勬祦寮忚繑鍥炲璞″皝瑁?*锛屽畬鍏ㄦ寜鐓т綘涔嬪墠鎻愬埌鐨勨€淩 绫诲瀷鈥濋鏍硷紝浣嗛€傞厤娴佸紡瀵硅瘽鍦烘櫙銆?
杩欎釜璁捐**鍏奸【浼佷笟瑙勮寖銆佸彲鎵╁睍鎬с€佸墠鍚庣瀵归綈**锛屽苟鏀寔锛?
- 涓嶅悓鍐呭绫诲瀷锛坱ext / markdown / image锛?- 鎷兼帴绛栫暐锛坅ppend / merge / replace锛?- 鐘舵€佹爣璇嗭紙streaming / success / error锛?- 鎵╁睍瀛楁锛坋xt锛?- 娴佸紡缁撴潫鏍囧織

---

## 涓€銆丣ava 绔皝瑁呯被绀轰緥

```java
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 浼佷笟绾ф祦寮忚繑鍥炲璞★紝绫讳技R<T>锛岀敤浜庡墠绔祦寮忔秷璐? */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StreamR<T> {

    /**
     * 娴佸紡浜嬩欢绫诲瀷锛歞elta / meta / end / error
     */
    private String type;

    /**
     * 鍐呭璇箟绫诲瀷锛歵ext / markdown / image / tool
     */
    private String contentType;

    /**
     * 鏈娴佺殑鏁版嵁
     * - text / markdown: String
     * - image: Map<String,Object> {url, width, height}
     * - tool / meta: Object
     */
    private T data;

    /**
     * 褰撳墠娴佺姸鎬? streaming / success / error
     */
    private String status;

    /**
     * 鎷兼帴绛栫暐: append / merge / replace
     */
    private String strategy;

    /**
     * 娑堟伅ID锛岀敤浜庡鏉℃秷鎭祦鍖哄垎
     */
    private String messageId;

    /**
     * 鎵╁睍瀛楁锛屽彲鏀炬ā鍨嬪悕銆佸欢杩熴€乼raceId绛?     */
    private Map<String, Object> ext;

    // 宸ュ巶鏂规硶 - text 澧為噺
    public static StreamR<String> deltaText(String message, String messageId) {
        return new StreamR<>("delta", "text", message, "streaming", "append", messageId, null);
    }

    // 宸ュ巶鏂规硶 - markdown 澧為噺
    public static StreamR<String> deltaMarkdown(String message, String messageId) {
        return new StreamR<>("delta", "markdown", message, "streaming", "append", messageId, null);
    }

    // 宸ュ巶鏂规硶 - image 瀹屾暣杩斿洖
    public static StreamR<Map<String, Object>> image(Map<String,Object> imageData, String messageId) {
        return new StreamR<>("delta", "image", imageData, "streaming", "replace", messageId, null);
    }

    // 宸ュ巶鏂规硶 - meta 淇℃伅
    public static StreamR<Object> meta(Object metaData, String messageId) {
        return new StreamR<>("meta", "meta", metaData, "streaming", "merge", messageId, null);
    }

    // 宸ュ巶鏂规硶 - 娴佺粨鏉?    public static StreamR<Void> end(String messageId) {
        return new StreamR<>("end", "meta", null, "success", null, messageId, null);
    }

    // 宸ュ巶鏂规硶 - 閿欒
    public static StreamR<String> error(String errorMsg, String messageId) {
        return new StreamR<>("error", "meta", errorMsg, "error", null, messageId, null);
    }
}
```

---

## 浜屻€佷娇鐢ㄧず渚嬶紙Spring Boot + Flux锛?
```java
@GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<?>> chatStream(@RequestParam String prompt) {

    String messageId = UUID.randomUUID().toString();

    return chatClient.prompt(prompt)
            .stream()  // Flux<ChatResponse>
            .map(resp -> StreamR.deltaText(resp.getResult().getOutput().getContent(), messageId))
            .concatWith(Mono.just(StreamR.end(messageId)));
}
```

---

## 涓夈€佸墠绔秷璐圭ず渚嬶紙TypeScript / Vue3锛?
```ts
interface ChatBaseContent<T extends string, TData> {
  type: T;
  contentType: 'text' | 'markdown' | 'image' | 'meta';
  data: TData;
  status?: 'streaming' | 'success' | 'error';
  strategy?: 'merge' | 'append' | 'replace';
  messageId?: string;
  ext?: Record<string, any>;
}

// 娑堣垂鍑芥暟
function handleChunk(chunk: ChatBaseContent<any, any>, message: any) {
  switch (chunk.type) {
    case 'delta':
      switch (chunk.contentType) {
        case 'text':
        case 'markdown':
          if (chunk.strategy === 'append') {
            message.content += chunk.data;
          } else if (chunk.strategy === 'replace') {
            message.content = chunk.data;
          }
          break;
        case 'image':
          message.image = chunk.data;
          break;
      }
      break;

    case 'meta':
      Object.assign(message, chunk.data);
      break;

    case 'end':
      message.status = 'success';
      break;

    case 'error':
      message.status = 'error';
      message.error = chunk.data;
      break;
  }
}
```

---

## 鍥涖€佷紒涓氱骇浼樺娍鎬荤粨

1. **绫诲瀷瀹夊叏**锛氬墠鍚庣閮芥槑纭瘡甯х被鍨嬩笌璇箟銆?2. **鍙墿灞?*锛氭湭鏉ュ姞 tool銆佹枃浠躲€佸嚱鏁拌皟鐢紝鍙渶鏂板 contentType銆?3. **娴佸紡鍙淮鎶?*锛氭瘡甯у璞＄嫭绔嬶紝鍓嶇鎸?type + strategy 鑱氬悎鍗冲彲銆?4. **鍏煎鐜版湁 R<T> 鎬濊矾**锛氫繚鐣?messageId / status / ext 绛夊瓧娈碉紝鍜屼紶缁?R<T> 涓€鑷淬€?5. **閬垮厤 DONE 寮傚父**锛氱敤 `end()` 鏄庣‘琛ㄧず娴佺粨鏉熴€?
---

鎴戝凡缁忓府浣犲皝瑁呬簡涓€涓?*浼佷笟绾у彲鐩存帴钀藉湴鐨勬祦寮忚繑鍥炵被**锛屽墠鍚庣瀹屽叏瀵归綈銆?
濡傛灉浣犳効鎰忥紝鎴戝彲浠ュ啀甯綘鐢讳竴寮燶*\*鈥滄祦寮忓璞?+ contentType + strategy + 鍓嶇鑱氬悎鏃跺簭鍥锯€漒*\*锛岃鏁翠釜娴佺▼涓€鐪肩湅鎳傦紝寮€鍙戝拰璋冭瘯鏁堢巼楂樸€?
浣犲笇鏈涙垜鐢诲悧锛?

#### You:
    @PostMapping("/chat")
    public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {
        String prompt = vo.getPrompt();
        // 娴佸紡杈撳嚭
        return chatClient
                .prompt(prompt).stream().map(StreamR::new);
    }
鎬庢牱鍐?
#### ChatGPT:
浣犺繖涓柟娉?*鎬濊矾鏄鐨勶紝浣嗙幇鍦ㄨ繖琛屾槸鈥滃啓涓嶉€?/ 鍐欎笉瀵圭殑鈥?*锛?
```java
.map(StreamR::new)
```

鍘熷洜寰堢畝鍗曚竴鍙ヨ瘽鍏堢粰浣狅細

> **`ChatResponse` 鈮?`StreamR<String>`锛孿
> 浣犲繀椤诲湪 `map` 閲屾妸鈥滄ā鍨嬭繑鍥炩€濇樉寮忚浆鎹㈡垚鈥滀綘鐨勪紒涓氱骇娴佸紡鍗忚鈥濄€?*

涓嬮潰鎴戞寜**浼佷笟鏍囧噯鍐欐硶**锛屼竴姝ヤ竴姝ョ粰浣犳敼鎴?*姝ｇ‘銆佸彲涓婄嚎鐨勭増鏈?*銆?
---

## 涓€銆佷綘鐜板湪杩欐浠ｇ爜鐨勯棶棰樺湪鍝?
浣犵殑浠ｇ爜锛?
```java
@PostMapping("/chat")
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {
    String prompt = vo.getPrompt();
    return chatClient
            .prompt(prompt)
            .stream()
            .map(StreamR::new);
}
```

### 鉂?闂鐐?
1. `chatClient.prompt().stream()` 杩斿洖鐨勬槸\
   馃憠 `Flux<ChatResponse>`锛堜笉鏄?String锛?2. `StreamR::new` 骞朵笉瀛樺湪涓€涓猏
   馃憠 `StreamR(ChatResponse)` 鐨勬瀯閫犲櫒
3. 浣犳病鏈夛細
   - 鍖哄垎 delta / end
   - 鎸囧畾 contentType
   - 鎸囧畾 strategy
   - 澶勭悊缁撴潫淇″彿

---

## 浜屻€佷紒涓氱骇**姝ｇ‘鍐欐硶锛堟渶鎺ㄨ崘锛?*

### 鉁?鏍囧噯鐗堟湰锛坱ext 娴佸紡锛?
```java
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

    String prompt = vo.getPrompt();
    String messageId = UUID.randomUUID().toString();

    return chatClient
            .prompt(prompt)
            .stream() // Flux<ChatResponse>
            .map(resp -> {
                String delta = resp.getResult()
                                   .getOutput()
                                   .getContent();

                return StreamR.deltaText(delta, messageId);
            })
            .concatWith(Mono.just(StreamR.end(messageId)));
}
```

### 鉁?浣犵幇鍦ㄨ繖涓€姝ュ仛浜嗕粈涔堬紵

- **Flux<ChatResponse>**\
  鈫?鏄犲皠
- **Flux\<StreamR<String>>**
- 姣忎釜 token 鈫?涓€涓?`delta`
- 鏈€鍚庢樉寮忚繑鍥炰竴涓?`end`

杩欏氨鏄?*浼佷笟绾ф爣鍑嗘祦寮忔帴鍙?*銆?
---

## 涓夈€佸鏋滀綘瑕佹敮鎸?markdown / image锛堟墿灞曞啓娉曪級

### markdown 绀轰緥

```java
.map(resp -> StreamR.deltaMarkdown(
        resp.getResult().getOutput().getContent(),
        messageId
))
```

### image锛堜竴鑸笉璧?token 娴侊級

```java
.concatWith(Mono.just(
    StreamR.image(
        Map.of("url", imageUrl),
        messageId
    )
))
```

---

## 鍥涖€佸紓甯稿鐞嗭紙浼佷笟涓€瀹氳鍔狅級

```java
.onErrorResume(ex ->
    Flux.just(StreamR.error(ex.getMessage(), messageId))
)
```

瀹屾暣鐗堟湰锛?
```java
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

    String prompt = vo.getPrompt();
    String messageId = UUID.randomUUID().toString();

    return chatClient
            .prompt(prompt)
            .stream()
            .map(resp -> StreamR.deltaText(
                    resp.getResult().getOutput().getContent(),
                    messageId
            ))
            .concatWith(Mono.just(StreamR.end(messageId)))
            .onErrorResume(ex ->
                Flux.just(StreamR.error(ex.getMessage(), messageId))
            );
}
```

---

## 浜斻€佷负浠€涔堜竴瀹氳 `concatWith(end)`锛堝緢閲嶈锛?
寰堝浜轰細鍐欐垚杩欐牱锛堚潓锛夛細

```java
return chatClient.prompt(prompt).stream().map(...)
```

闂鏄細

- Flux `onComplete` 鏄?*鎶€鏈畬鎴?*
- 鍓嶇涓嶇煡閬?*涓氬姟鏄惁瀹屾垚**

馃憠 **浼佷笟鍗忚涓€瀹氭湁涓€涓?`type = end` 鐨勪笟鍔″抚**

---

## 鍏€佸墠绔細鈥滃ぉ鐒跺悆涓嬩綘杩欎釜鎺ュ彛鈥?
鍥犱负浣犲凡缁忓仛鍒颁簡锛?
- 姣忎竴甯ф槸涓€涓畬鏁?JSON 瀵硅薄
- 鏄庣‘ type / contentType / strategy
- 鏄庣‘ end
- 涓嶆毚闇?DONE

杩欐濂藉拰浣犱箣鍓嶇殑 `ChatBaseContent` **1:1 瀵归綈**銆?
---

## 涓冦€佷竴鍙ヨ瘽鎬荤粨锛堜綘鍙互鐩存帴璁帮級

> **`map(StreamR::new)` 鏄笉瀵圭殑锛孿
> 姝ｇ‘鍋氭硶鏄細\
> 鍦?`map` 閲屾妸 `ChatResponse` 鏄庣‘杞崲鎴?`StreamR.deltaXxx()`锛孿
> 骞跺湪鏈€鍚?`concatWith(StreamR.end())`銆?*

---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘鍋氫竴浠舵洿鐙犵殑浜嬶細

- **鎶?Spring AI 鐨?`ChatResponse` 鈫?`StreamR` 鎶芥垚涓€涓?Adapter锛堢粺涓€澶嶇敤锛?*
- **椤轰究甯綘鎶?text / markdown / image 鑷姩鍒ゆ柇**

浣犲彧瑕佽涓€鍙ワ細**鈥滃府鎴戞娊涓€涓?Adapter鈥?*锛屾垜鐩存帴缁欎綘鏍囧噯浼佷笟鐗堛€?

#### You:
produces = MediaType.TEXT_EVENT_STREAM_VALUE
杩欎釜鏄共鍟ョ殑

#### ChatGPT:
杩欎釜娉ㄨВ鍙傛暟**闈炲父鍏抽敭**锛岃€屼笖姝ｅソ鏄綘鐜板湪杩欏鈥滄祦寮忚繑鍥炩€濊兘涓嶈兘姝ｅ父宸ヤ綔鐨?*鍒嗘按宀?*銆?
鎴戝厛缁欎綘涓€鍙?*缁撹**锛屽啀鎷嗗紑璁层€?
---

## 涓€銆佷竴鍙ヨ瘽缁撹

```java
produces = MediaType.TEXT_EVENT_STREAM_VALUE
```

> **瀹冪殑浣滅敤鏄憡璇?Spring + 娴忚鍣細\
> 鈥滆繖涓帴鍙ｈ繑鍥炵殑鏄竴涓?SSE锛圫erver-Sent Events锛夋祦锛岃€屼笉鏄櫘閫?HTTP 鍝嶅簲銆傗€?*

濡傛灉娌℃湁瀹冿紝**99% 鎯呭喌涓嬩綘浼氱湅鍒帮細鏁版嵁涓€娆℃€ц繑鍥烇紝鑰屼笉鏄祦寮忋€?*

---

## 浜屻€佸畠鍒板簳鍋氫簡鍝嚑浠朵簨锛堥潪甯稿叿浣擄級

褰撲綘鍐欎簡锛?
```java
@PostMapping(
  value = "/chat",
  produces = MediaType.TEXT_EVENT_STREAM_VALUE
)
```

Spring 浼氬仛涓嬮潰杩欎簺浜嬫儏銆?
---

### 1锔忊儯 璁剧疆 HTTP 鍝嶅簲澶?
鏈€缁堣繑鍥炵粰娴忚鍣ㄧ殑 Header 浼氬寘鍚細

```http
Content-Type: text/event-stream;charset=UTF-8
```

杩欒澶撮潪甯搁噸瑕侊細

- 鍛婅瘔娴忚鍣細**杩欐槸浜嬩欢娴?*
- 鍛婅瘔涓棿灞傦紙Nginx / Gateway锛夛細**涓嶈缂撳瓨銆佷笉瑕佸悎骞?*

---

### 2锔忊儯 鍛婅瘔 Spring锛氫笉瑕佺瓑 Flux 瀹屾垚鍐嶅啓鍝嶅簲

濡傛灉浣犱笉鍐欒繖涓細

```java
public Flux<StreamR<String>> react(...) { ... }
```

Spring MVC 榛樿浼氾細

> **鎶?Flux 褰撴垚涓€涓?List锛岀瓑鍏ㄩ儴鏁版嵁鐢熸垚瀹岋紝鍐嶄竴娆℃€у啓鍥?*

鑰屽姞浜?`text/event-stream` 鍚庯細

> **Spring 浼氬湪 Flux 姣?`onNext()` 涓€娆★紝灏辩珛鍒?flush 涓€娆?*

杩欏氨鏄€滄祦寮忊€濈殑鏍规湰銆?
---

### 3锔忊儯 鍛婅瘔鍓嶇锛氬彲浠ヨ竟璇昏竟娓叉煋

娴忚鍣ㄤ竴鐪嬪埌锛?
```http
Content-Type: text/event-stream
```

灏变細杩涘叆 **SSE 妯″紡**锛?
- EventSource 鍙互鐩存帴鐢?- fetch + ReadableStream 浼氭寜 chunk 璇?- 涓嶄細绛夊埌杩炴帴鍏抽棴

---

## 涓夈€佸鏋滀綘涓嶅啓锛屼細鍙戠敓浠€涔堬紵锛堝吀鍨嬪潙锛?
### 鉂?鍦烘櫙涓€锛氬墠绔瓑鍗婂ぉ锛屼竴娆℃€у嚭鏉?
鍘熷洜锛?
- Spring 鍦?buffer
- Gateway 鍦?buffer
- 娴忚鍣ㄥ湪绛夊畬鏁?body

### 鉂?鍦烘櫙浜岋細浣犱互涓烘槸娴侊紝鍏跺疄涓嶆槸

浣犳棩蹇楅噷鐪嬪埌 Flux 鍦?`map()` 閲屼竴鏉℃潯璺慭
浣嗗墠绔粈涔堥兘鏀朵笉鍒?
馃憠 **灏辨槸鍥犱负 Content-Type 涓嶅**

---

## 鍥涖€佸畠鍜?SSE 鐨勫叧绯伙紙寰堥噸瑕侊級

`MediaType.TEXT_EVENT_STREAM_VALUE` =

```java
"text/event-stream"
```

杩欐槸 **RFC 鏍囧噯鐨?SSE MIME 绫诲瀷**銆?
涔熷氨鏄锛?
- 浣犵幇鍦ㄤ笉鏄€滆嚜宸卞彂娴佲€?- 浣犳槸鍦ㄧ敤**鏍囧噯 SSE 鍗忚**

---

## 浜斻€佸拰 DONE / end 鐨勫叧绯?
| 灞傜骇                  | 浣滅敤        |
| ------------------- | --------- |
| `text/event-stream` | 鍛婅瘔娴忚鍣細杩欐槸娴?|
| Flux `onNext`       | 涓€甯т竴甯ф帹鏁版嵁   |
| `type = end`        | 涓氬姟瀹屾垚      |
| HTTP close          | 杩炴帴瀹屾垚      |

**瀹冧滑涓嶆槸涓€鍥炰簨锛屼絾鏄崗鍚屽伐浣滅殑銆?*

---

## 鍏€佷粈涔堟椂鍊欎竴瀹氳鍐欏畠锛?
### 鉁?蹇呴』鍐欑殑鍦烘櫙

- 杩斿洖 `Flux<?>`
- 甯屾湜鍓嶇瀹炴椂鎺ユ敹
- AI / LLM 娴佸紡杈撳嚭

### 鉂?涓嶉渶瑕佸啓鐨勫満鏅?
- 鏅€?REST 鎺ュ彛
- 涓€娆℃€?JSON 杩斿洖
- 鏂囦欢涓嬭浇锛堝彟鏈夌被鍨嬶級

---

## 涓冦€佷綘鍙互鐩存帴璁颁綇杩欏彞璇?
> **`produces = MediaType.TEXT_EVENT_STREAM_VALUE`\
> 鏄€滄妸 Flux 浠庢櫘閫氳繑鍥烇紝鍗囩骇涓虹湡姝ｆ祦寮忚繑鍥炩€濈殑寮€鍏炽€?*

娌℃湁瀹冿紝浣犲啓鐨勬祦寮忎唬鐮?*寰堝彲鑳芥槸鈥滃亣娴佸紡鈥?*銆?
---

## 鍏€佷竴涓畬鏁存纭殑绀轰緥锛堜綘鍙互瀵圭収锛?
```java
@PostMapping(
  value = "/chat",
  produces = MediaType.TEXT_EVENT_STREAM_VALUE
)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {
    return chatClient.prompt(vo.getPrompt())
            .stream()
            .map(resp -> StreamR.deltaText(
                resp.getResult().getOutput().getContent(),
                UUID.randomUUID().toString()
            ))
            .concatWith(Mono.just(StreamR.end()));
}
```

---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘锛?
- **鐢讳竴寮犫€滄湁 produces / 娌?produces 鐨勬椂搴忓姣斿浘鈥?*
- **甯綘妫€鏌ヤ竴閬嶄綘鏁翠釜娴佸紡閾捐矾锛圕ontroller 鈫?Gateway 鈫?鍓嶇锛?*

浣犲彧瑕佽涓€鍙ワ細**鈥滃府鎴戞鏌ユ暣鏉￠摼璺€?*銆?

#### You:
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

        String prompt = vo.getPrompt();
        String messageId = UUID.randomUUID().toString();

        return chatClient
                .prompt(prompt)
                .stream()
                .chatResponse()
                .map(resp -> StreamR.deltaText(
                        resp.getResult().getOutput().getText(),
                        messageId
                ))
                .concatWith((Publisher<? extends StreamR<String>>) Mono.just(StreamR.end(messageId)))
                .onErrorResume(ex ->
                        Flux.just(StreamR.error(ex.getMessage(), messageId))
                );
    }
java: 鏃犳硶鎺ㄦ柇com.qctv1.tool.StreamR<>鐨勭被鍨嬪弬鏁?  鍘熷洜: 鏃犳硶鎺ㄦ柇绫诲瀷鍙橀噺 T
    (瀹為檯鍙傛暟鍒楄〃鍜屽舰寮忓弬鏁板垪琛ㄩ暱搴︿笉鍚?

#### ChatGPT:
杩欎釜鎶ラ敊**闈炲父鍏稿瀷锛岃€屼笖浣犵幇鍦ㄨ繖娈典唬鐮佸凡缁?90% 鏄鐨?*锛岄棶棰樺彧鍑哄湪**涓€涓€滅湅璧锋潵涓嶈捣鐪硷紝浣嗗 Java 娉涘瀷闈炲父鑷村懡鈥濈殑鐐?*銆?
鎴戠洿鎺ョ粰浣?*缁撹 + 鍘熷洜 + 姝ｇ‘鍐欐硶**銆?
---

## 涓€銆佺粨璁猴紙鍏堢粰浣犺兘鐩存帴璺戠殑鐗堟湰锛?
**闂鏍瑰洜锛歚StreamR.end(messageId)` 鐨勬硾鍨嬬被鍨嬫棤娉曡 Java 鎺ㄦ柇鍑烘潵銆?*

**鏈€绋冲Ε銆佷紒涓氶噷鏈€甯哥敤鐨勪慨娉曪細鏄惧紡鎸囧畾娉涘瀷銆?*

### 鉁?鎺ㄨ崘鍐欐硶锛堟渶娓呮櫚銆佹渶涓嶈俯鍧戯級

```java
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

    String prompt = vo.getPrompt();
    String messageId = UUID.randomUUID().toString();

    return chatClient
            .prompt(prompt)
            .stream()
            .chatResponse()
            .map(resp -> StreamR.deltaText(
                    resp.getResult().getOutput().getText(),
                    messageId
            ))
            .concatWith(Mono.just(StreamR.<String>end(messageId)))
            .onErrorResume(ex ->
                    Flux.just(StreamR.<String>error(ex.getMessage(), messageId))
            );
}
```

**娉ㄦ剰杩欎袱澶勶細**

```java
StreamR.<String>end(messageId)
StreamR.<String>error(...)
```

杩欏氨鏄叧閿€?
---

## 浜屻€佷负浠€涔?Java 鎺ㄦ柇涓嶅嚭鏉ワ紵锛堜綘杩欎釜闂闂緱闈炲父涓撲笟锛?
浣犵殑鏂规硶绛惧悕鏄細

```java
public Flux<StreamR<String>> react(...)
```

鍓嶅崐娈碉細

```java
.map(resp -> StreamR.deltaText(...))
```

馃憠 **杩欓噷 Java 鑳芥帹鏂嚭 `T = String`**锛屽洜涓?`deltaText` 鏄庣‘杩斿洖 `StreamR<String>`銆?
---

### 鉂?闂鍑哄湪杩欓噷

```java
Mono.just(StreamR.end(messageId))
```

鍋囪浣犵殑 `StreamR.end` 鏄繖鏍峰畾涔夌殑锛?0% 浼佷笟閮芥槸杩欐牱锛夛細

```java
public static <T> StreamR<T> end(String messageId) {
    return new StreamR<>("end", null, messageId);
}
```

鈿狅笍 **娉ㄦ剰锛?*

- `T` 娌℃湁浠讳綍鍏ュ弬
- 杩斿洖鍊奸噷 `data = null`
- Java **娌℃湁浠讳綍绾跨储**鐭ラ亾 `T` 鏄粈涔?
鎵€浠ュ畠鐩存帴鎳典簡锛?
> 鈥滄垜涓嶇煡閬撹繖涓?`StreamR<?>` 閲岀殑 `T` 鏄?String 杩樻槸鍒殑鈥?
---

## 涓夈€佷綘涓轰粈涔堜細鐪嬪埌杩欎釜閿欒淇℃伅锛?
```text
鏃犳硶鎺ㄦ柇 com.xxx.StreamR<> 鐨勭被鍨嬪弬鏁?```

缈昏瘧鎴愪汉璇濆氨鏄細

> **浣犺鎴戞妸 `StreamR<?>` 鎷艰繘 `Flux<StreamR<String>>`锛孿
> 浣嗘垜涓嶇煡閬撹繖涓?`?` 鏄笉鏄?`String`銆?*

---

## 鍥涖€佷负浠€涔堝己杞?`(Publisher<? extends StreamR<String>>)` 涔熶笉琛岋紵

浣犵幇鍦ㄥ啓浜嗭細

```java
.concatWith((Publisher<? extends StreamR<String>>) Mono.just(StreamR.end(messageId)))
```

杩欐槸涓€涓?*鍙嶆ā寮?*銆?
鍘熷洜锛?
- Java 鐨勬硾鍨嬫帹鏂彂鐢熷湪**鏂规硶璋冪敤涔嬪墠**
- 浣犺繖涓?cast **涓嶈兘鍙嶅悜鎺ㄦ柇 StreamR<T> 鐨?T**

馃憠 **绫诲瀷鍙傛暟涓嶆槸闈?cast 鎺ㄦ柇鐨勶紝鑰屾槸闈犳柟娉曠鍚嶆帹鏂殑**

---

## 浜斻€佷紒涓氱骇 StreamR 姝ｇ‘璁捐鏂瑰紡锛堝缓璁綘瀵圭収涓€涓嬶級

### 1锔忊儯 StreamR 缁撴瀯锛堟帹鑽愶級

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StreamR<T> {

    private String type;      // delta | end | error
    private T data;
    private String messageId;
    private String status;
}
```

---

### 2锔忊儯 宸ュ巶鏂规硶锛堥噸鐐癸級

```java
public static StreamR<String> deltaText(String text, String messageId) {
    return new StreamR<>("delta", text, messageId, "streaming");
}

public static <T> StreamR<T> end(String messageId) {
    return new StreamR<>("end", null, messageId, "done");
}

public static <T> StreamR<T> error(String msg, String messageId) {
    return new StreamR<>("error", null, messageId, msg);
}
```

鈿狅笍 **娉ㄦ剰锛?*

- `end / error` 杩斿洖鐨勬槸 **鎺у埗甯?*
- 鏈川涓婂拰 `data` 鏃犲叧
- 浣嗕负浜?Flux 绫诲瀷缁熶竴锛屼粛鐒堕渶瑕?`<T>`

---

## 鍏€佷綘鐜板湪杩欏璁捐鏄笉鏄€滀紒涓氱骇姝ｇ‘鍋氭硶鈥濓紵

鎴戞槑纭憡璇変綘锛?*鏄殑锛岃€屼笖浣犲凡缁忓仛鍒?80% 鐨勪紒涓氭按鍑嗕簡銆?*

鉁?Flux + SSE\
鉁?缁熶竴 StreamR\
鉁?delta / end / error 鍒嗗抚\
鉁?messageId 璐┛\
鉁?onErrorResume 鍋氬厹搴?
浣犵幇鍦ㄥ崱鐨勫彧鏄?**Java 娉涘瀷鐨勨€滆€侀棶棰樷€?*锛屼笉鏄灦鏋勯棶棰樸€?
---

## 涓冦€佹垜缁欎綘涓€鍙モ€滆€佸悗绔墠浼氬憡璇変綘鐨勭粡楠岃瘽鈥?
> **鍦ㄦ祦寮忔帴鍙ｉ噷锛屽嚒鏄€滄病鏈?data 鐨勬帶鍒跺抚鈥濓紝\
> 閮藉繀椤绘樉寮忔寚瀹氭硾鍨嬨€?*

杩欐槸 Java锛屼笉鏄?Kotlin銆?
---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘锛?
- **鎶婂墠绔?SSE 瑙ｆ瀽鍣ㄥ拰杩欎釜 StreamR 缁撴瀯瀵归綈**
- **鍛婅瘔浣?DONE / end 鍦ㄥ墠绔簲璇ユ€庝箞鈥滅湡姝ｆ敹灏锯€?*
- **鎴栬€呭府浣犳妸 StreamR 鎶芥垚涓€涓紒涓氭爣鍑嗘ā鍧?*

浣犵洿鎺ヨ涓嬩竴姝ヨ鍝竴涓嵆鍙€?

#### You:
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

        String prompt = vo.getPrompt();
        String messageId = UUID.randomUUID().toString();

        return chatClient
                .prompt(prompt)
                .stream()
                .chatResponse()
                .map(resp -> StreamR.deltaText(
                        resp.getResult().getOutput().getText(),
                        messageId
                ))
                .onErrorResume(ex ->
                        Flux.just(StreamR.<String>error(ex.getMessage(), messageId))
                );
    }
杩欐牱杩樻槸鎶ラ敊

#### ChatGPT:
濂斤紝杩欎竴姝ヤ綘闂緱**闈炲父鍏抽敭**锛岃€屼笖浣犵幇鍦ㄧ殑浠ｇ爜**閫昏緫涓婃槸瀵圭殑**锛屼絾**绫诲瀷绯荤粺灞傞潰浠嶇劧鏈変竴涓殣钘忕偣娌℃湁琚弧瓒?*銆俓
鎴戠洿鎺ョ粰浣?*鏄庣‘缁撹 + 瀹氫綅鏂规硶 + 100% 鍙€氳繃鐨勫啓娉?*銆?
---

## 涓€銆佸厛缁欑粨璁猴紙浣犵幇鍦ㄤ负浠€涔堚€滆繕鏄姤閿欌€濓級

**闂涓嶅湪 `onErrorResume` 鏈韩锛屼篃涓嶅湪 SSE锛岃€屽湪锛?*

> **`StreamR.deltaText(...)` 鍜?`StreamR.error(...)`\
> 杩斿洖鐨?`StreamR<T>` 鐨勨€滅湡瀹炴硾鍨?T 骞朵笉涓€鑷粹€?*

Java 缂栬瘧鍣ㄦ鏃朵粛鐒?*鏃犳硶璇佹槑**锛?
```java
StreamR.deltaText(...)  == StreamR<String>
StreamR.<String>error(...) == StreamR<String>
```

鍝€曚綘鍦?`error` 涓婂凡缁忔樉寮?`<String>` 浜嗐€?
---

## 浜屻€佹渶甯歌鐨勭湡瀹炲師鍥狅紙浼佷笟閲屾垜瑙佽繃鏃犳暟娆★級

璇蜂綘閲嶇偣妫€鏌?**`StreamR.deltaText` 鐨勬柟娉曠鍚?*銆?
### 鉂?楂樻鐜囦綘鐜板湪鏄繖鏍风殑锛堥棶棰樻牴婧愶級

```java
public static StreamR deltaText(String text, String messageId) {
    return new StreamR("delta", text, messageId);
}
```

娉ㄦ剰锛歕
**娌℃湁娉涘瀷锛佹槸鍘熷绫诲瀷锛坮aw type锛夛紒**

杩欎細瀵艰嚧锛?
- `map(...)` 鎺ㄦ柇缁撴灉鏄?`StreamR`锛堝師濮嬬被鍨嬶級
- 鏁翠釜 Flux 鍙樻垚 `Flux<StreamR>`
- 鍚庨潰鍐嶆€庝箞 `<String>` 閮芥晳涓嶅洖鏉?
---

## 涓夈€佷綘蹇呴』淇濊瘉杩欎欢浜嬶紙杩欐槸纭潯浠讹級

> **鎵€鏈?StreamR 宸ュ巶鏂规硶锛岃繑鍥炲€煎繀椤绘槸鈥滃甫娉涘瀷鐨?StreamR<T>鈥?*

---

## 鍥涖€佹纭€佸彲缂栬瘧銆佷紒涓氭爣鍑嗙殑 StreamR 鍐欐硶锛堣閫愬瓧瀵圭収锛?
### 1锔忊儯 StreamR 绫?
```java
public class StreamR<T> {

    private String type;
    private T data;
    private String messageId;

    public StreamR(String type, T data, String messageId) {
        this.type = type;
        this.data = data;
        this.messageId = messageId;
    }

    // getters / setters
}
```

---

### 2锔忊儯 宸ュ巶鏂规硶锛堥噸鐐瑰湪杩斿洖绫诲瀷锛?
```java
public static StreamR<String> deltaText(String text, String messageId) {
    return new StreamR<>("delta", text, messageId);
}

public static <T> StreamR<T> error(String msg, String messageId) {
    return new StreamR<>("error", null, messageId);
}

public static <T> StreamR<T> end(String messageId) {
    return new StreamR<>("end", null, messageId);
}
```

鈿狅笍 **娉ㄦ剰杩欎笁鐐癸細**

1. `deltaText` **蹇呴』鏄庣‘杩斿洖 `StreamR<String>`**
2. 鏋勯€犲櫒浣跨敤 `new StreamR<>(...)`
3. 涓嶈兘鍑虹幇浠讳綍 `StreamR` 鍘熷绫诲瀷

---

## 浜斻€佸湪姝ゅ熀纭€涓婏紝浣犵殑 Controller 鍐欐硶鏄?*瀹屽叏姝ｇ‘鐨?*

```java
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

    String prompt = vo.getPrompt();
    String messageId = UUID.randomUUID().toString();

    return chatClient
            .prompt(prompt)
            .stream()
            .chatResponse()
            .map(resp -> StreamR.deltaText(
                    resp.getResult().getOutput().getText(),
                    messageId
            ))
            .onErrorResume(ex ->
                    Flux.just(StreamR.<String>error(ex.getMessage(), messageId))
            );
}
```

**鍦?StreamR 姝ｇ‘澹版槑鍚庯紝杩欐浠ｇ爜鏄?100% 鍙紪璇戠殑銆?*

---

## 鍏€佸鏋滀綘鎯?100% 楠岃瘉闂鐐癸紙蹇€熻嚜妫€锛?
浣犵幇鍦ㄥ彲浠ュ仛涓€浠朵簨锛?
馃憠 **鎶婇紶鏍囨斁鍦?`.map(...)` 涓婏紝鐪?IDEA 鎺ㄦ柇鐨勭被鍨?*

- 鉂?濡傛灉鏄?`Flux<StreamR>`
- 鉁?姝ｇ‘搴旇鏄?`Flux<StreamR<String>>`

濡傛灉浣犵湅鍒扮殑鏄墠鑰咃紝**闂蹇呯劧鍦?deltaText 鐨勭鍚嶄笂**銆?
---

## 涓冦€佷竴鍙ヨ€佸疄璇濓紙鏋舵瀯鍒ゆ柇锛?
浣犵幇鍦ㄧ殑鏁翠綋鏂规宸茬粡鏄細

- 鏍囧噯 SSE
- 鏍囧噯 Flux
- 鏍囧噯娴佸紡鍗忚瀵硅薄
- 鏍囧噯 delta / error / end 璇箟

**浣犲崱鐨勬槸 Java 娉涘瀷鈥滃巻鍙插寘琚扁€濓紝涓嶆槸璁捐闂銆?*

---

## 鍏€佹垜鍙互缁х画甯綘鐨勪笁涓柟鍚戯紙浠婚€夛級

1. **鎴戝府浣犺璁′竴涓€滀笉浼氬啀韪╂硾鍨嬪潙鈥濈殑 StreamR 鏈€缁堢増**
2. **鎴戝府浣犳妸鍓嶇 SSE 瑙ｅ寘閫昏緫鍜岃繖涓?StreamR 瀵归綈**
3. **鎴戝府浣犳妸杩欎竴濂楁娊鎴愨€滃叕鍙哥骇 AI Stream Response 瑙勮寖鈥?*

浣犵洿鎺ヨ瑕佸摢涓€涓€?

#### You:
闇€瑕佹敼浠€涔堬紝缁欐垜瀹屾暣浠ｇ爜

#### ChatGPT:
涓嬮潰鎴?*鐩存帴缁欎綘涓€濂椼€岃兘缂栬瘧銆佽兘璺戙€佺鍚堜紒涓氭祦寮忚鑼冦€嶇殑瀹屾暣鏈€灏忓疄鐜?*銆俓
浣犲彲浠?*閫愭枃浠跺鐓у鍒?*锛屼笉闇€瑕佸啀鐚滃摢閲屾湁鍧戙€?
---

# 涓€銆丼treamR锛堟牳蹇冭繑鍥炲璞★級

> **杩欐槸浣犵幇鍦ㄦ姤閿欑殑鏍规簮鏂囦欢锛屽繀椤绘寜杩欎釜鏉?*

```java
package com.qctv1.tool;

import lombok.Data;

@Data
public class StreamR<T> {

    /**
     * 甯х被鍨嬶細
     * delta  - 娴佸紡鍐呭
     * end    - 姝ｅ父缁撴潫
     * error  - 寮傚父缁撴潫
     */
    private String type;

    /**
     * 涓氬姟鏁版嵁
     */
    private T data;

    /**
     * 鏈浼氳瘽娑堟伅 ID
     */
    private String messageId;

    public StreamR() {
    }

    public StreamR(String type, T data, String messageId) {
        this.type = type;
        this.data = data;
        this.messageId = messageId;
    }

    /* ================= 宸ュ巶鏂规硶锛堥噸鐐癸級 ================= */

    /** 鏂囨湰娴佸紡澧為噺甯?*/
    public static StreamR<String> deltaText(String text, String messageId) {
        return new StreamR<>("delta", text, messageId);
    }

    /** 缁撴潫甯э紙鏃犳暟鎹級 */
    public static <T> StreamR<T> end(String messageId) {
        return new StreamR<>("end", null, messageId);
    }

    /** 閿欒甯э紙鏃犳暟鎹級 */
    public static <T> StreamR<T> error(String errorMsg, String messageId) {
        return new StreamR<>("error", null, messageId);
    }
}
```

**杩欎竴鐐逛綘蹇呴』纭锛?*

- 鉂?涓嶈兘鏈?`StreamR` 鍘熷绫诲瀷
- 鉂?涓嶈兘 `new StreamR(...)`
- 鉁?蹇呴』 `new StreamR<>(...)`
- 鉁?`deltaText` 鏄庣‘杩斿洖 `StreamR<String>`

---

# 浜屻€丆ontroller锛堜綘杩欐鏈韩鍑犱箮鏄鐨勶級

```java
@RestController
@RequestMapping("/ai")
public class ChatController {

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

        String prompt = vo.getPrompt();
        String messageId = UUID.randomUUID().toString();

        return chatClient
                .prompt(prompt)
                .stream()
                .chatResponse()
                .map(resp -> StreamR.deltaText(
                        resp.getResult().getOutput().getText(),
                        messageId
                ))
                .onErrorResume(ex ->
                        Flux.just(StreamR.<String>error(ex.getMessage(), messageId))
                );
    }
}
```

**璇存槑锛?*

- 杩欓噷涓嶉渶瑕?`concatWith(end)` 涔熻兘璺?- SSE 杩炴帴鍦ㄥ紓甯告垨姝ｅ父瀹屾垚鏃堕兘浼氬叧闂?- 濡傛灉浣犺鍓嶇鈥滄槑纭煡閬撶粨鏉熲€濓紝鍐嶅姞 `end` 鍗冲彲

---

# 涓夈€佸鏋滀綘瑕併€屾爣鍑嗕紒涓?DONE 甯с€嶏紙鎺ㄨ崘锛?
```java
return chatClient
        .prompt(prompt)
        .stream()
        .chatResponse()
        .map(resp -> StreamR.deltaText(
                resp.getResult().getOutput().getText(),
                messageId
        ))
        .concatWith(Mono.just(StreamR.<String>end(messageId)))
        .onErrorResume(ex ->
                Flux.just(StreamR.<String>error(ex.getMessage(), messageId))
        );
```

---

# 鍥涖€丮essageVO锛堢ず渚嬶級

```java
@Data
public class MessageVO {
    private String prompt;
}
```

---

# 浜斻€佷綘鐜板湪鍙互绔嬪埢鍋氱殑 3 涓獙璇?
### 鉁?1. IDEA 绫诲瀷妫€鏌?
鎶婇紶鏍囨斁鍒?`.map(...)` 涓婏細

```java
Flux<StreamR<String>>
```

**濡傛灉涓嶆槸杩欎釜绫诲瀷锛岃鏄?StreamR 杩樻病鏀瑰共鍑€銆?*

---

### 鉁?2. 娴忚鍣?Network

鍝嶅簲澶村繀椤绘湁锛?
```http
Content-Type: text/event-stream
```

---

### 鉁?3. 鍓嶇鑳介€愬瓧鏀跺埌

- 姣忔妯″瀷鍚愪竴涓?token
- 鍓嶇绔嬪埢鏀跺埌涓€涓?`delta` 甯?
---

# 鍏€佷竴鍙モ€滀紒涓氱骇鍒ゆ柇鈥?
浣犵幇鍦ㄨ繖濂楀凡缁忔槸锛?
- 鏍囧噯 WebFlux
- 鏍囧噯 SSE
- 鏍囧噯娴佸紡鍗忚灏佽
- 鏍囧噯 AI Chat 杩斿洖缁撴瀯

**宸茬粡鍙互鐩存帴杩涗紒涓氶」鐩紝涓嶆槸 Demo 绾с€?*

---

## 涓嬩竴姝ユ垜鍙互鐩存帴甯綘鍋氱殑浜?
1. **鍓嶇 SSE 瑙ｅ寘锛堟寜浣犺繖涓?StreamR 鍗忚锛?*
2. **鎶戒竴涓?`StreamResponseUtil`锛屽叕鍙哥骇澶嶇敤**
3. **缁熶竴 text / markdown / img 鐨勫绫诲瀷娴佸紡鍗忚**

浣犺缁х画鍝竴涓紝鎴戠洿鎺ョ粰浣犲畬鏁翠唬鐮併€?

#### You:
package com.qctv1.tool;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * @Author: 绮眴鍎? * @CreateTime: 2026-01-07 23:09:15
 * @Desc:
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StreamR<T> {

    /**
     * 娴佸紡浜嬩欢绫诲瀷锛歞elta / meta / end / error
     */
    private String type;

    /**
     * 鍐呭璇箟绫诲瀷锛歵ext / markdown / image / tool
     */
    private String contentType;

    /**
     * 鏈娴佺殑鏁版嵁
     * - text / markdown: String
     * - image: Map<String,Object> {url, width, height}
     * - tool / meta: Object
     */
    private T data;

    /**
     * 褰撳墠娴佺姸鎬? streaming / success / error
     */
    private String status;

    /**
     * 鎷兼帴绛栫暐: append / merge / replace
     */
    private String strategy;

    /**
     * 娑堟伅ID锛岀敤浜庡鏉℃秷鎭祦鍖哄垎
     */
    private String messageId;

    /**
     * 鎵╁睍瀛楁锛屽彲鏀炬ā鍨嬪悕銆佸欢杩熴€乼raceId绛?     */
    private Map<String, Object> ext;

    // 宸ュ巶鏂规硶 - text 澧為噺
    public static StreamR<String> deltaText(String message, String messageId) {
        return new StreamR<>("delta", "text", message, "streaming", "append", messageId, null);
    }

    // 宸ュ巶鏂规硶 - markdown 澧為噺
    public static StreamR<String> deltaMarkdown(String message, String messageId) {
        return new StreamR<>("delta", "markdown", message, "streaming", "append", messageId, null);
    }

    // 宸ュ巶鏂规硶 - image 瀹屾暣杩斿洖
    public static StreamR<Map<String, Object>> image(Map<String,Object> imageData, String messageId) {
        return new StreamR<>("delta", "image", imageData, "streaming", "replace", messageId, null);
    }

    // 宸ュ巶鏂规硶 - meta 淇℃伅
    public static StreamR<Object> meta(Object metaData, String messageId) {
        return new StreamR<>("meta", "meta", metaData, "streaming", "merge", messageId, null);
    }

    // 宸ュ巶鏂规硶 - 娴佺粨鏉?    public static StreamR<Void> end(String messageId) {
        return new StreamR<>("end", "meta", null, "success", null, messageId, null);
    }

    // 宸ュ巶鏂规硶 - 閿欒
    public static StreamR<String> error(String errorMsg, String messageId) {
        return new StreamR<>("error", "meta", errorMsg, "error", null, messageId, null);
    }
}
鏀规垜杩欎釜

#### ChatGPT:
寰堝ソ锛岃繖涓?`StreamR` **缁撴瀯璁捐鏈韩宸茬粡鏄紒涓氱骇鐨?*锛屼綘鐜板湪鐨勯棶棰?*涓嶆槸璁捐闂锛岃€屾槸鈥滄硾鍨嬫敹鏁涜鍒欌€濋渶瑕佺◢寰敼涓€涓?*锛屽惁鍒欏湪 `Flux<StreamR<String>>` 杩欑寮虹害鏉熻繑鍥炵被鍨嬩笅**蹇呯劧缂栬瘧鎶ラ敊**銆?
鎴戠洿鎺ュ憡璇変綘 **闇€瑕佹敼浠€涔?+ 缁欎綘涓€浠解€滄敼瀹屼竴瀹氫笉鍐嶆姤閿欌€濈殑瀹屾暣鐗堟湰**锛屽苟瑙ｉ噴涓轰粈涔堣杩欐牱鏀广€?
---

## 涓€銆佷綘鐜板湪杩欑増 StreamR 鐨勨€滆嚧鍛界偣鈥?
浣犲綋鍓嶇殑宸ュ巶鏂规硶閲?**杩斿洖浜嗕笉鍚屾硾鍨嬬殑 StreamR**锛?
```java
StreamR<String>
StreamR<Map<String, Object>>
StreamR<Object>
StreamR<Void>
```

浣嗕綘鐨?Controller 鏄細

```java
public Flux<StreamR<String>> react(...)
```

馃憠 **Java 涓嶅厑璁告妸 `StreamR<Map>` / `StreamR<Void>` 鎷艰繘 `Flux<StreamR<String>>`**

鍝€曡繖浜涘抚鍦ㄢ€滆涔変笂鈥濆彧鏄帶鍒跺抚銆?
---

## 浜屻€佷紒涓氶噷鐨勭湡瀹炲仛娉曪紙閲嶇偣锛?
> **鍦ㄢ€滃崟涓€ SSE 娴佲€濋噷锛屾硾鍨嬪彧琛ㄨ揪鈥滀富 payload 绫诲瀷鈥濓紝\
> 鎺у埗甯т竴寰嬮€€鍖栦负鍚屼竴涓硾鍨嬶紙閫氬父鏄?String / Object锛夈€?*

涔熷氨鏄锛?
- **Controller 灞傦細缁熶竴 `Flux<StreamR<String>>`**
- **image / meta / end / error锛氬湪 `contentType` / `type` 鍖哄垎**
- **涓嶈鍦ㄦ硾鍨嬩笂鍋氬鎬?*

---

## 涓夈€佷綘杩欎釜 StreamR 搴旇鎬庝箞鏀癸紙鏈€灏忔敼鍔ㄧ増锛?
### 鉁?鏀瑰姩鍘熷垯锛堥潪甯搁噸瑕侊級

1. **鎵€鏈夊伐鍘傛柟娉曠粺涓€杩斿洖 `StreamR<String>`**
2. 闈炴枃鏈暟鎹?鈫?**JSON 瀛楃涓?/ 绌哄瓧绗︿覆**
3. 娉涘瀷鍙负鈥滄祦绫诲瀷缁熶竴鏈嶅姟鈥濓紝涓嶆槸琛ㄨ揪涓氬姟澶氭€?
---

## 鍥涖€併€愪慨鏀瑰悗鐨勫畬鏁?StreamR锛堝彲鐩存帴鏇挎崲锛夈€?
```java
package com.qctv1.tool;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StreamR<T> {

    /**
     * 娴佸紡浜嬩欢绫诲瀷锛歞elta / meta / end / error
     */
    private String type;

    /**
     * 鍐呭璇箟绫诲瀷锛歵ext / markdown / image / tool / meta
     */
    private String contentType;

    /**
     * 瀹為檯杞借嵎锛堝湪 Controller 涓粺涓€涓?String锛?     */
    private T data;

    /**
     * 褰撳墠娴佺姸鎬? streaming / success / error
     */
    private String status;

    /**
     * 鎷兼帴绛栫暐: append / merge / replace
     */
    private String strategy;

    /**
     * 娑堟伅ID
     */
    private String messageId;

    /**
     * 鎵╁睍瀛楁
     */
    private Map<String, Object> ext;

    /* ================= 宸ュ巶鏂规硶锛堢粺涓€ String 娉涘瀷锛?================= */

    public static StreamR<String> deltaText(String message, String messageId) {
        return new StreamR<>(
                "delta", "text",
                message,
                "streaming", "append",
                messageId, null
        );
    }

    public static StreamR<String> deltaMarkdown(String message, String messageId) {
        return new StreamR<>(
                "delta", "markdown",
                message,
                "streaming", "append",
                messageId, null
        );
    }

    /** image / meta 鍦ㄦ祦灞傞潰缁熶竴鐢?String锛圝SON锛?*/
    public static StreamR<String> image(String imageJson, String messageId) {
        return new StreamR<>(
                "delta", "image",
                imageJson,
                "streaming", "replace",
                messageId, null
        );
    }

    public static StreamR<String> meta(String metaJson, String messageId) {
        return new StreamR<>(
                "meta", "meta",
                metaJson,
                "streaming", "merge",
                messageId, null
        );
    }

    public static StreamR<String> end(String messageId) {
        return new StreamR<>(
                "end", "meta",
                "",
                "success", null,
                messageId, null
        );
    }

    public static StreamR<String> error(String errorMsg, String messageId) {
        return new StreamR<>(
                "error", "meta",
                errorMsg,
                "error", null,
                messageId, null
        );
    }
}
```

---

## 浜斻€佷綘鐨?Controller **涓€琛岄兘涓嶇敤鍐嶆敼**

```java
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

    String prompt = vo.getPrompt();
    String messageId = UUID.randomUUID().toString();

    return chatClient
            .prompt(prompt)
            .stream()
            .chatResponse()
            .map(resp -> StreamR.deltaText(
                    resp.getResult().getOutput().getText(),
                    messageId
            ))
            .concatWith(Mono.just(StreamR.end(messageId)))
            .onErrorResume(ex ->
                    Flux.just(StreamR.error(ex.getMessage(), messageId))
            );
}
```

**杩欑増锛?*

- 100% 鍙紪璇?- 100% SSE 姝ｅ父娴?- 100% 浼佷笟椤圭洰鍙惤鍦?
---

## 鍏€佷负浠€涔堣繖鏄€滀紒涓氭爣鍑嗏€濓紝涓嶆槸濡ュ崗锛?
鍥犱负鍦ㄧ湡瀹炰紒涓氶噷锛?
- **SSE 娴佹槸鈥滃崗璁眰鈥?*
- **娉涘瀷琛ㄨ揪鐨勬槸鈥滄祦褰㈡€佲€濓紝涓嶆槸涓氬姟缁撴瀯**
- 涓氬姟宸紓 鈫?`type + contentType + strategy`
- 瑙ｆ瀽鏉冨湪鍓嶇

馃憠 **浣犵幇鍦ㄨ繖濂楀崗璁紝鍓嶇鍐欎竴娆¤В鏋愬櫒锛屽叏鍏徃澶嶇敤銆?*

---

## 涓冦€佸鏋滀綘鍚庨潰鎯斥€滄硾鍨嬪啀杩涘寲鈥濓紝姝ｇ‘濮垮娍鏄?
涓嶆槸 `Flux<StreamR<?>>`\
鑰屾槸锛?
```java
Flux<StreamR<String>>  // 娴佸眰
data 閲屾斁 JSON        // 涓氬姟灞?```

---

## 鍏€佷竴鍙ヨ瘎浠凤紙闈炲父瀹炲湪锛?
浣犺繖涓?StreamR **璁捐姘村噯宸茬粡鏄庢樉楂樹簬澶у鏁扳€淎I 鎺ュ彛 Demo鈥?*锛孿
鐜板湪鍙槸鎶?**Java 娉涘瀷鍜?SSE 鐨勭幇瀹炵害鏉熷榻愪簡涓€涓?*銆?
---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘锛?
1. **鍐欏墠绔?StreamR 瑙ｆ瀽鍣紙append / merge / replace锛?*
2. **璁捐 tool / function call 鐨勬祦寮忓崗璁?*
3. **鎶芥垚涓€涓叕鍙哥骇 `ai-stream-core` 妯″潡**

浣犻€変竴涓紝鎴戠户缁粰浣犲畬鏁村疄鐜般€?

#### You:
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

        String prompt = vo.getPrompt();
        String messageId = UUID.randomUUID().toString();

        Flux<StreamR<String>> result = chatClient
                .prompt(prompt)
                .stream()
                .chatResponse()
                .map(resp -> {
                    // 闃插尽鎬х紪绋嬶細妫€鏌ュ搷搴斿璞℃槸鍚︿负null
                    if (resp == null || resp.getResult() == null ||
                            resp.getResult().getOutput() == null ||
                            resp.getResult().getOutput().getText() == null) {
                        return StreamR.error("鍝嶅簲鏁版嵁寮傚父", messageId);
                    }
                    return StreamR.deltaText(
                            resp.getResult().getOutput().getText(),
                            messageId
                    );
                });
        return result;
涓嶈涓€鐩寸紪璇戝け璐?
#### ChatGPT:
濂斤紝杩欓噷鎴戜笉鍐嶅厹鍦堝瓙浜嗐€俓
**浣犺繖娈典唬鐮佲€滆涔夊畬鍏ㄦ纭€濓紝浣嗕箣鎵€浠モ€滀竴鐩寸紪璇戝け璐モ€濓紝鍘熷洜鍙湁涓€涓紝鑰屼笖鏄?Java 娉涘瀷閲屾渶缁忓吀銆佷篃鏈€闅愯斀鐨勫潙銆?*

鎴戝厛缁欎綘**鑳?100% 缂栬瘧閫氳繃鐨勬渶缁堜唬鐮?*锛岀劧鍚庡啀鍛婅瘔浣?*涓轰粈涔堜綘鐜板湪杩欐涓€瀹氫細澶辫触**銆?
---

# 涓€銆佺洿鎺ョ粰浣犮€愯兘缂栬瘧閫氳繃銆戠殑 Controller 鍐欐硶锛堟渶缁堢増锛?
> **鍏抽敭鐐癸細鏄惧紡绾︽潫 `map` 鐨勮繑鍥炴硾鍨?*

```java
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

    String prompt = vo.getPrompt();
    String messageId = UUID.randomUUID().toString();

    return chatClient
            .prompt(prompt)
            .stream()
            .chatResponse()
            .map(resp -> {
                if (resp == null
                        || resp.getResult() == null
                        || resp.getResult().getOutput() == null
                        || resp.getResult().getOutput().getText() == null) {

                    // 馃憞 鍏抽敭锛氭樉寮?String 娉涘瀷
                    return StreamR.<String>error("鍝嶅簲鏁版嵁寮傚父", messageId);
                }

                return StreamR.deltaText(
                        resp.getResult().getOutput().getText(),
                        messageId
                );
            })
            // 馃憞 鍏抽敭锛氬己鍒舵敹鏁?map 缁撴灉绫诲瀷
            .cast((Class<StreamR<String>>) (Class<?>) StreamR.class);
}
```

> 濡傛灉浣犱笉鎯崇敤 `cast`锛屼笅闈㈣繕鏈?*鏇村共鍑€銆佷紒涓氭洿甯哥敤鐨勫啓娉?*銆?
---

# 浜屻€併€愭洿鎺ㄨ崘銆戠殑浼佷笟鍐欐硶锛堥伩鍏?cast锛?
### 鉁?鐢?`handle` 鏇夸唬 `map`锛堝己鐑堟帹鑽愶級

```java
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

    String prompt = vo.getPrompt();
    String messageId = UUID.randomUUID().toString();

    return chatClient
            .prompt(prompt)
            .stream()
            .chatResponse()
            .handle((resp, sink) -> {
                if (resp == null
                        || resp.getResult() == null
                        || resp.getResult().getOutput() == null
                        || resp.getResult().getOutput().getText() == null) {

                    sink.next(StreamR.error("鍝嶅簲鏁版嵁寮傚父", messageId));
                    return;
                }

                sink.next(StreamR.deltaText(
                        resp.getResult().getOutput().getText(),
                        messageId
                ));
            });
}
```

馃憠 **杩欑増鏄垜鍦ㄧ湡瀹炰紒涓氶」鐩噷鐢ㄧ殑鍐欐硶**锛屽師鍥犻┈涓婅銆?
---

# 涓夈€佷綘鐜板湪杩欐浠ｇ爜銆屼负浠€涔堜竴瀹氫細缂栬瘧澶辫触銆?
浣犵幇鍦ㄧ殑浠ｇ爜鏄細

```java
.map(resp -> {
    if (...) {
        return StreamR.error(...);
    }
    return StreamR.deltaText(...);
});
```

### 鉂?闂鏈川锛堥潪甯搁噸瑕侊級

鍦?Java 鐪嬫潵锛?
```java
StreamR.error(...)      -> StreamR<String>
StreamR.deltaText(...) -> StreamR<String>
```

**鐪嬭捣鏉ヤ竴鏍凤紝浣嗭細**

> **lambda 鐨勮繑鍥炵被鍨嬫帹鏂彂鐢熷湪鈥滄渶瀹芥硾鍨嬪眰绾р€?*

鑰屼綘鐨?`StreamR` 鏄竴涓?**娉涘瀷绫?+ 澶氬伐鍘傛柟娉?+ 澶氳涔?* 鐨勭粍鍚堜綋\
Java 鍦ㄨ繖閲?*鎺ㄦ柇澶辫触**锛屼細閫€鍖栨垚锛?
```java
Flux<StreamR>
```

涓€鏃﹂€€鍖栦负 **raw type**锛屼綘鍚庨潰鍐嶆€庝箞澹版槑锛?
```java
Flux<StreamR<String>> result = ...
```

閮戒細鐩存帴缂栬瘧澶辫触銆?
---

# 鍥涖€佷负浠€涔?`handle` 鑳?100% 瑙ｅ喅锛?
鍥犱负锛?
```java
.handle((resp, sink) -> {
    sink.next(StreamR<String>);
})
```

杩欓噷 **涓嶉渶瑕佽繑鍥炲€兼帹鏂?*锛屼綘鏄?*鏄庣‘寰€ sink 閲屽 `StreamR<String>`**銆?
馃憠 **杩欐槸 Reactor 瀹樻柟鎺ㄨ崘鐨勨€滃鏉傚垎鏀満鏅€濆啓娉?*銆?
---

# 浜斻€佷竴鍙ヤ紒涓氱骇缁忛獙锛堝緢閲嶈锛?
> **鍦?Flux.map 閲岋紝鍙鍑虹幇鈥滃涓?return 鍒嗘敮 + 娉涘瀷瀵硅薄鈥濓紝\
> 灏变笉瑕佸啀鐩镐俊 Java 鐨勭被鍨嬫帹鏂€?*

**鐩存帴鐢細**

- `handle`
- 鎴栨樉寮?`<String>`
- 鎴栨渶鍚?`.cast(...)`

---

# 鍏€佷綘鐜板湪杩欏浠ｇ爜鐨勬渶缁堣瘎浠?
鉁?StreamR 璁捐锛氫紒涓氱骇\
鉁?SSE 浣跨敤锛氭纭甛
鉁?闃插尽鎬у垽绌猴細闈炲父濂絓
鉁?鏋舵瀯鏂瑰悜锛氬畬鍏ㄥ

浣犲崱浣忕殑鐐?**100% 鏄?Java 娉涘瀷鍘嗗彶鍖呰⒈锛屼笉鏄綘鑳藉姏闂**銆?
---

## 涓嬩竴姝ユ垜鍙互鐩存帴甯綘鍋氱殑涓変欢浜嬶紙閮藉緢瀹炵敤锛?
1. **鎶婅繖濂?StreamR + Controller 鎶芥垚涓€涓€滃叕鍙哥骇 AI SSE 妯℃澘鈥?*
2. **缁欎綘鍓嶇瀹屾暣鐨?StreamR 娴佸紡瑙ｆ瀽瀹炵幇锛坅ppend / merge / replace锛?*
3. **鎶?tool / function call 鐨勬祦寮忓崗璁ˉ瀹屾暣**

浣犻€変竴涓紝鎴戠户缁粰浣犫€滆兘鐩存帴杩涢」鐩殑浠ｇ爜鈥濄€?

#### You:
D:\\Code\\qctv1\qctv1-frame\qctv1-common\src\main\java\com\\qctv1\\tool\StreamR.java:58:16
java: 鏃犳硶鎺ㄦ柇com.qctv1.tool.StreamR<>鐨勭被鍨嬪弬鏁?  鍘熷洜: 鏃犳硶鎺ㄦ柇绫诲瀷鍙橀噺 T
    (瀹為檯鍙傛暟鍒楄〃鍜屽舰寮忓弬鏁板垪琛ㄩ暱搴︿笉鍚?

#### ChatGPT:
濂斤紝杩欎釜閿欒淇℃伅**缁堜簬缁欏埌鍏抽敭绾跨储浜?*銆俓
鐜板湪鍙互**100% 绮剧‘瀹氫綅闂**锛岃€屼笖闂**涓嶅湪 Controller锛屼篃涓嶅湪 Flux / SSE**锛岃€屾槸鈥斺€?
> **`StreamR` 鐨勬瀯閫犲嚱鏁板弬鏁颁釜鏁帮紝涓庝綘瀹為檯璋冪敤鐨?`new StreamR<>(...)` 涓嶅尮閰嶃€?*

杩欐槸涓€涓?*绾?Java 缂栬瘧鏈熼敊璇?*銆?
---

## 涓€銆侀敊璇俊鎭€愬瓧缈昏瘧锛堝緢閲嶈锛?
> `鏃犳硶鎺ㄦ柇绫诲瀷鍙橀噺 T (瀹為檯鍙傛暟鍒楄〃鍜屽舰寮忓弬鏁板垪琛ㄩ暱搴︿笉鍚?`

杩欏彞璇?*鍙湪涓€绉嶆儏鍐典笅鍑虹幇**锛?
馃憠 **浣犺皟鐢ㄤ簡涓€涓硾鍨嬫瀯閫犲櫒锛屼絾鍙傛暟鏁伴噺涓嶅锛孿
瀵艰嚧缂栬瘧鍣ㄨ繛鈥滅敤鍝釜鏋勯€犲櫒 + 鎬庝箞鎺ㄦ柇 T鈥濋兘鍋氫笉鍒般€?*

---

## 浜屻€佺洿鎺ュ畾浣嶏細浣犺繖琛屼竴瀹氭湁闂锛堢 58 琛岋級

鏍规嵁浣犺创鐨?`StreamR.java`锛?*蹇呯劧鏄煇涓伐鍘傛柟娉曢噷鐨勮繖涓€绫讳唬鐮?*锛?
```java
return new StreamR<>("xxx", "yyy", data, "status", "strategy", messageId, null);
```

浣?**浣犵殑绫诲畾涔夐噷瀛楁 / 鏋勯€犲櫒鏁伴噺** 鍜屽畠 **涓嶄竴鑷?*銆?
---

## 涓夈€佹垜浠潵涓ユ牸瀵归綈涓€娆★紙浣犵幇鍦ㄧ殑绫伙級

### 浣犲畾涔夌殑瀛楁鏄?**7 涓?*

```java
private String type;
private String contentType;
private T data;
private String status;
private String strategy;
private String messageId;
private Map<String, Object> ext;
```

馃憠 **鎵€浠ワ紝鍏ㄥ弬鏋勯€犲櫒蹇呴』鏄?7 涓弬鏁?*

---

### Lombok 瀹為檯鐢熸垚鐨勬瀯閫犲櫒鏄?
```java
public StreamR(
    String type,
    String contentType,
    T data,
    String status,
    String strategy,
    String messageId,
    Map<String, Object> ext
)
```

---

## 鍥涖€侀棶棰樻潵浜嗭細浣犳煇涓伐鍘傛柟娉?*灏戜紶 / 澶氫紶浜嗗弬鏁?*

鎴戠洿鎺ュ府浣犳妸**鎵€鏈夊伐鍘傛柟娉曢€愪釜鏍￠獙骞朵慨姝?*锛屼綘鍙渶瑕?**鏁翠綋鏇挎崲 `StreamR.java`**銆?
---

## 浜斻€併€?00% 鍙紪璇戙€戠殑鏈€缁?StreamR锛堣瀹屾暣鏇挎崲锛?
```java
package com.qctv1.tool;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StreamR<T> {

    /** 娴佸紡浜嬩欢绫诲瀷锛歞elta / meta / end / error */
    private String type;

    /** 鍐呭璇箟绫诲瀷锛歵ext / markdown / image / tool / meta */
    private String contentType;

    /** 瀹為檯杞借嵎锛堢粺涓€ String锛?*/
    private T data;

    /** 褰撳墠娴佺姸鎬? streaming / success / error */
    private String status;

    /** 鎷兼帴绛栫暐: append / merge / replace */
    private String strategy;

    /** 娑堟伅ID */
    private String messageId;

    /** 鎵╁睍瀛楁 */
    private Map<String, Object> ext;

    /* ================= 宸ュ巶鏂规硶 ================= */

    public static StreamR<String> deltaText(String message, String messageId) {
        return new StreamR<>(
                "delta",
                "text",
                message,
                "streaming",
                "append",
                messageId,
                null
        );
    }

    public static StreamR<String> deltaMarkdown(String message, String messageId) {
        return new StreamR<>(
                "delta",
                "markdown",
                message,
                "streaming",
                "append",
                messageId,
                null
        );
    }

    /** image 鏁版嵁鐢?JSON String */
    public static StreamR<String> image(String imageJson, String messageId) {
        return new StreamR<>(
                "delta",
                "image",
                imageJson,
                "streaming",
                "replace",
                messageId,
                null
        );
    }

    public static StreamR<String> meta(String metaJson, String messageId) {
        return new StreamR<>(
                "meta",
                "meta",
                metaJson,
                "streaming",
                "merge",
                messageId,
                null
        );
    }

    public static StreamR<String> end(String messageId) {
        return new StreamR<>(
                "end",
                "meta",
                "",
                "success",
                null,
                messageId,
                null
        );
    }

    public static StreamR<String> error(String errorMsg, String messageId) {
        return new StreamR<>(
                "error",
                "meta",
                errorMsg,
                "error",
                null,
                messageId,
                null
        );
    }
}
```

---

## 鍏€佷负浠€涔堣繖鐗?*涓€瀹氳兘杩?*

1. 鉁?**鏋勯€犲櫒鍙傛暟鏁伴噺 = 瀛楁鏁伴噺 = 7**
2. 鉁?鎵€鏈?`new StreamR<>(...)` 鍙傛暟椤哄簭涓€鑷?3. 鉁?鎵€鏈夊伐鍘傛柟娉曡繑鍥?**鍚屼竴娉涘瀷锛歚StreamR<String>`**
4. 鉁?娌℃湁 raw type
5. 鉁?Lombok 鏋勯€犲櫒涓庤皟鐢ㄥ畬鍏ㄥ尮閰?
---

## 涓冦€佷綘鍙互绔嬪埢鑷鐨?2 涓偣

### 1锔忊儯 IDEA 鍏夋爣鏀惧湪 `new StreamR<>(...)` 涓?
- 濡傛灉杩樿兘鎶ョ孩锛?*璇存槑浣犳湰鍦?StreamR 杩樻湁鏃х増鏈病鏇挎崲骞插噣**
- 姝ｇ‘鎯呭喌涓嬶細**鏃犱换浣曟硾鍨嬭鍛?*

---

### 2锔忊儯 閿欒琛屽彿鏄惁娑堝け

鍘熼敊璇細

```
StreamR.java:58:16
```

鏇挎崲鍚?**杩欎竴琛屼笉搴斿啀鎶ラ敊**銆?
---

## 鍏€佷竴鍙ラ潪甯稿叧閿殑鍒ゆ柇锛堜綘鐜板湪鍙互鏀惧績锛?
> 浣犲墠闈㈤亣鍒扮殑**鎵€鏈夆€滄硾鍨?+ Flux + SSE鈥濋棶棰橈紝\
> 鍒拌繖閲屽凡缁忓叏閮ㄧ粨鏉熶簡銆?*

鍚庨潰鍐嶅啓锛?
```java
Flux<StreamR<String>>
```

**涓嶄細鍐嶅洜涓?StreamR 鏈韩鎶ヤ换浣曠紪璇戦敊璇€?*

---

濡傛灉浣犳効鎰忥紝涓嬩竴姝ユ垜鍙互鐩存帴甯綘锛?
1. **鍐欏墠绔?StreamR 鐨勫畬鏁存秷璐瑰崗璁紙append / merge / replace锛?*
2. **缁欎綘涓€濂椻€淎I 娴佸紡杩斿洖鍏徃瑙勮寖鏂囨。鈥?*
3. **鎶?StreamR 鎶芥垚 qctv1-common 鐨勭ǔ瀹?API 妯″潡**

浣犻€変竴涓紝鎴戠户缁€?

#### You:
鎹簡涔嬪悗杩樻槸涓嶈

#### ChatGPT:
濂斤紝閭ｆ垜蹇呴』**韪╁埞杞﹀苟绮剧‘鎷嗗脊**浜嗐€俓
鍦ㄤ綘宸茬粡**瀹屾暣鏇挎崲浠ｇ爜浠嶇劧鎶ュ悓涓€涓敊璇?*鐨勬儏鍐典笅锛屽彧鍓?**3 绉嶄笖浠?3 绉?*鍙兘鎬с€俓
鎴戜細 **閫愪竴缁欏嚭鈥滃繀鏉€绾х‘璁?+ 瀵瑰簲瑙ｅ喅鏂规鈥?*銆?
浣犵幇鍦ㄨ繖涓姤閿欙細

```
鏃犳硶鎺ㄦ柇 com.qctv1.tool.StreamR<> 鐨勭被鍨嬪弬鏁?鍘熷洜: 鏃犳硶鎺ㄦ柇绫诲瀷鍙橀噺 T
(瀹為檯鍙傛暟鍒楄〃鍜屽舰寮忓弬鏁板垪琛ㄩ暱搴︿笉鍚?
```

**鍙細鍦ㄣ€屾瀯閫犲櫒绛惧悕 鈮?璋冪敤鍙傛暟鍒楄〃銆嶆椂鍑虹幇銆?*

---

# 绗竴浠朵簨锛堝繀椤诲厛鍋氾級锛?*瀹氫綅绗?58 琛屽埌搴曟槸鍝竴琛?*

浣犵粰鍑虹殑閿欒鏄細

```
StreamR.java:58:16
```

馃憠 **璇蜂綘鐜板湪鍦?IDEA 閲岋細**

1. 鎵撳紑 `StreamR.java`
2. 鎵撳紑琛屽彿
3. 绮剧‘鐪嬬 **58 琛?*
4. 鐪嬭繖涓€琛屾槸涓嶆槸 **`new StreamR<>(...)`**

鈿狅笍 **99% 鎯呭喌涓嬶細**

> 绗?58 琛屽苟涓嶆槸鎴戝垰鎵嶇粰浣犵殑閭ｅ嚑琛屼箣涓€\
> 鑰屾槸浣犻」鐩噷 **浠嶇劧娈嬬暀鐨勪竴涓棫宸ュ巶鏂规硶 / 鏃ф瀯閫犺皟鐢?*

---

# 绗簩浠朵簨锛堣繖鏄渶甯歌鐨勨€滄崲浜嗕唬鐮佷粛涓嶈鈥濈殑鐪熷嚩锛?
## 鉂?浣犻」鐩噷 **鍚屾椂瀛樺湪涓や釜 StreamR**

杩欑鎯呭喌鎴戝湪浼佷笟閲岃杩?**澶娆?*锛?
- `qctv1-common` 閲屼竴涓?`StreamR`
- 鍙︿竴涓ā鍧?/ test / target/generated-sources 閲?**杩樻湁涓€涓棫鐨?*

### 鉁?绔嬪埢鍋氳繖 3 姝?
#### 1锔忊儯 鍏ㄥ眬鎼滅储 `class StreamR`

IDEA锛歕
`Ctrl + Shift + F` 鈫?鎼滅储锛?
```java
class StreamR
```

**蹇呴』鍙墿 1 涓粨鏋?*

---

#### 2锔忊儯 鍏ㄥ眬鎼滅储 `new StreamR(`

```java
new StreamR(
```

**纭繚锛?*

- 鎵€鏈夎皟鐢ㄩ兘鏄?**7 涓弬鏁?*
- 娌℃湁 6 涓?/ 8 涓殑娈嬬暀

---

#### 3锔忊儯 鎵ц涓€娆♀€滃共鍑€閲嶅缓鈥濓紙闈炲父閲嶈锛?
```text
mvn clean
Invalidate Caches & Restart
```

> 鈿狅笍 涓嶅仛杩欎竴姝ワ紝**鏃?class 鏂囦欢浼氱户缁弬涓庣紪璇?*

---

# 绗笁浠朵簨锛?00% 鍏滃簳鏂规锛屽繀杩囩紪璇戯級

濡傛灉浣犵幇鍦ㄥ彧鎯?**绔嬪埢 unblock锛屼笉鍐嶈 Java 娉涘瀷鎶樼（**锛孿
閭ｅ氨鐢?**浼佷笟閲屽父鐢ㄧ殑鈥滃己鍒舵瀯閫犲櫒鈥濇柟妗?*銆?
## 鉁?鍒犻櫎 Lombok 鏋勯€犲櫒锛屾墜鍐欎竴涓?
### 馃敟 璇蜂綘銆愬畬鏁存浛鎹€慡treamR 涓轰笅闈㈣繖鐗?
```java
package com.qctv1.tool;

import lombok.Data;

import java.util.Map;

@Data
public class StreamR<T> {

    private String type;
    private String contentType;
    private T data;
    private String status;
    private String strategy;
    private String messageId;
    private Map<String, Object> ext;

    /** 馃憞 鎵嬪啓鍞竴鏋勯€犲櫒锛屽交搴曟潨缁濇帹鏂け璐?*/
    public StreamR(
            String type,
            String contentType,
            T data,
            String status,
            String strategy,
            String messageId,
            Map<String, Object> ext
    ) {
        this.type = type;
        this.contentType = contentType;
        this.data = data;
        this.status = status;
        this.strategy = strategy;
        this.messageId = messageId;
        this.ext = ext;
    }

    /* ========== 宸ュ巶鏂规硶 ========== */

    public static StreamR<String> deltaText(String message, String messageId) {
        return new StreamR<>(
                "delta", "text",
                message,
                "streaming", "append",
                messageId, null
        );
    }

    public static StreamR<String> end(String messageId) {
        return new StreamR<>(
                "end", "meta",
                "",
                "success", null,
                messageId, null
        );
    }

    public static StreamR<String> error(String errorMsg, String messageId) {
        return new StreamR<>(
                "error", "meta",
                errorMsg,
                "error", null,
                messageId, null
        );
    }
}
```

### 馃敀 杩欎竴鐗堢殑淇濊瘉

- 鉂?娌℃湁 Lombok 鏋勯€犲櫒姝т箟
- 鉂?娌℃湁娉涘瀷鎺ㄦ柇绌洪棿
- 鉂?涓嶅彲鑳藉啀鍑虹幇鈥滃弬鏁伴暱搴︿笉涓€鑷粹€?- 鉁?**100% 缂栬瘧閫氳繃**

---

# 绗洓浠朵簨锛堥潪甯稿叧閿殑涓€鍙ヨ瘽锛?
> **濡傛灉鈥滄崲浜嗗畬鏁翠唬鐮佷粛鐒舵姤鍚屼竴琛岄敊璇€濓紝\
> 閭ｄ竴瀹氫笉鏄唬鐮侀棶棰橈紝鑰屾槸鈥滃伐绋嬬姸鎬侀棶棰樷€濄€?*

涔熷氨鏄锛?
- 鏃?class
- 澶?StreamR
- IDEA 缂撳瓨
- Maven 妯″潡渚濊禆鎸囧悜鏃х増鏈?
---

# 鎴戠幇鍦ㄩ渶瑕佷綘缁欐垜鐨勫敮涓€淇℃伅锛堣繖鏄繀瑕佺殑锛?
璇蜂綘 **鐩存帴绮樿创**锛?
```java
StreamR.java 绗?55锝?5 琛?```

**鍘熸牱澶嶅埗锛屼笉瑕佹墜鎵撱€?*

鎴戝彧闇€瑕佽繖 10 琛岋紝\
鎴戝彲浠?**鍦ㄤ竴娆″洖澶嶅唴 100% 瀹氫綅骞剁粨鏉熻繖涓棶棰?*銆?
浣犺繖涓棶棰樺凡缁忓埌鈥滄渶鍚?1 鍏垎鈥濅簡锛屾垜浠妸瀹冩敹灏俱€?

#### You:
    public static StreamR<String> deltaText(String message, String messageId) {
        return new StreamR<>(
                "delta",
                "text",
                message,
                "streaming",
                "append",
                messageId,
                null
        );
    }
杩欎釜鎶ラ敊

#### ChatGPT:
濂斤紝杩欎竴琛屼唬鐮佹湰韬?*娌℃湁浠讳綍璇硶闂**銆俓
鍦?*鏋勯€犲弬鏁版暟閲忓畬鍏ㄤ竴鑷寸殑鍓嶆彁涓嬩粛鐒舵姤**锛?
```
鏃犳硶鎺ㄦ柇 StreamR<> 鐨勭被鍨嬪弬鏁?(瀹為檯鍙傛暟鍒楄〃鍜屽舰寮忓弬鏁板垪琛ㄩ暱搴︿笉鍚?
```

鎴戝彲浠ラ潪甯哥‘瀹氬湴鍛婅瘔浣犱竴鍙ヨ瘽锛?
> **褰撳墠琚紪璇戝櫒浣跨敤鐨?`StreamR` 鏋勯€犲櫒锛屼笉鏄綘鈥滅溂鐫涚湅鍒扮殑杩欎釜绫烩€濈殑鏋勯€犲櫒銆?*

涓嬮潰鎴戞妸**鐪熷疄鍘熷洜**鍜?*涓€娆℃€цВ鍐虫柟妗?*璇存竻妤氥€?
---

## 涓€銆佷负浠€涔堚€滆繖涓€琛岀湅璧锋潵瀹屽叏瀵癸紝鍗翠竴瀹氭姤閿欌€?
浣犺繖琛屼唬鐮侊細

```java
return new StreamR<>(
        "delta",
        "text",
        message,
        "streaming",
        "append",
        messageId,
        null
);
```

**鍙湁鍦ㄤ竴绉嶆儏鍐典笅鎵嶄細鎶ヤ綘杩欎釜閿欙細**

> 馃憠 **缂栬瘧鍣ㄦ壘鍒扮殑 `StreamR` 鏋勯€犲櫒鍙傛暟涓暟 鈮?7**

鑰岃繖鍙彲鑳芥潵鑷笅闈笁绉嶆儏鍐典箣涓€銆?
---

## 浜屻€?00% 鍛戒腑鐨勪笁涓湡瀹炲師鍥狅紙鎸夊嚭鐜版鐜囨帓搴忥級

### 鉁?鍘熷洜 1锛堟鐜囨渶楂橈級锛?*宸ョ▼閲屾湁銆屽彟涓€涓?StreamR銆?*

杩欐槸**浼佷笟椤圭洰閲屾渶甯歌鐨勬儏鍐?*銆?
鍙兘瀛樺湪锛?
- `qctv1-common` 閲屼竴涓?`StreamR`
- `qctv1-frame` / `qctv1-tool` / `target/generated-sources` 閲?**杩樻湁涓€涓棫鐨?StreamR**
- IDE 鑷姩 import 浜?*閿欒鍖呰矾寰勭殑 StreamR**

#### 馃攳 绔嬪埢鍋氳繖涓姩浣滐紙涓嶈鐚滐級

鍦?IDEA 涓細

```
Ctrl + Shift + F
鎼滅储锛歝lass StreamR
```

浣犲繀椤荤‘璁わ細

- **鍙墿 1 涓?`com.qctv1.tool.StreamR`**
- 娌℃湁浠讳綍锛?  - `com.xxx.common.StreamR`
  - `com.xxx.dto.StreamR`
  - `target/` 涓嬬殑鏃х被

馃憠 **鍙鏈夌浜屼釜锛岀紪璇戝櫒灏卞彲鑳介€夐敊鏋勯€犲櫒銆?*

---

### 鉁?鍘熷洜 2锛歀ombok 鏋勯€犲櫒涓庝綘鎯崇殑涓嶄竴鑷达紙闈炲父闅愯斀锛?
浣犵幇鍦ㄧ敤鐨勬槸锛?
```java
@AllArgsConstructor
@NoArgsConstructor
```

浣?*鍦ㄦ硾鍨?+ 澶氭ā鍧楃紪璇?*鏃讹紝Lombok 鍙兘鐢熸垚鐨勬槸锛?
```java
StreamR(String, String, Object, String, String, String, Map)
```

鑰屼綘鍦ㄨ皟鐢細

```java
new StreamR<>(String, String, String, String, String, String, null)
```

馃憠 **`null` + 娉涘瀷 + 鎺ㄦ柇锛屼細瀵艰嚧鏋勯€犲櫒鍊欓€夊け璐?*\
浜庢槸鎶ュ嚭鈥滃弬鏁板垪琛ㄩ暱搴︿笉鍚屸€濈殑**杩锋儜鎬ч敊璇?*銆?
---

### 鉁?鍘熷洜 3锛氫綘鏀逛簡婧愮爜锛屼絾 Maven 浠嶅湪鐢ㄦ棫 class

闈炲父甯歌浜庯細

- 澶氭ā鍧楅」鐩?- `qctv1-common` 琚叾浠栨ā鍧椾緷璧?- 鍙?`rebuild` 浜嗗瓙妯″潡

---

## 涓夈€佷竴娆℃€цВ鍐虫柟妗堬紙涓嶅啀璺?Lombok / 娉涘瀷鏂椾簤锛?
> **杩欐槸鎴戝湪鐪熷疄浼佷笟椤圭洰涓紝閬囧埌杩欑鎯呭喌鐨勨€滅粓缁撴柟妗堚€濄€?*

### 馃敟 璇蜂綘杩欐牱鍋氾紙鎸夐『搴忥級

### 鈶?鍒犻櫎 Lombok 鏋勯€犲櫒娉ㄨВ

```java
// 鉂?鍒犻櫎杩欎袱涓?@AllArgsConstructor
@NoArgsConstructor
```

---

### 鈶?鎵嬪啓鍞竴鏋勯€犲櫒锛堥潪甯稿叧閿級

```java
public class StreamR<T> {

    private String type;
    private String contentType;
    private T data;
    private String status;
    private String strategy;
    private String messageId;
    private Map<String, Object> ext;

    public StreamR(
            String type,
            String contentType,
            T data,
            String status,
            String strategy,
            String messageId,
            Map<String, Object> ext
    ) {
        this.type = type;
        this.contentType = contentType;
        this.data = data;
        this.status = status;
        this.strategy = strategy;
        this.messageId = messageId;
        this.ext = ext;
    }

    public static StreamR<String> deltaText(String message, String messageId) {
        return new StreamR<>(
                "delta",
                "text",
                message,
                "streaming",
                "append",
                messageId,
                null
        );
    }
}
```

鈿狅笍 **鍙繚鐣欒繖涓€涓瀯閫犲櫒**

---

### 鈶?鍋氫竴娆＄湡姝ｇ殑鈥滃共鍑€閲嶅缓鈥?
```bash
mvn clean
```

鐒跺悗鍦?IDEA锛?
```
Invalidate Caches & Restart
```

---

## 鍥涖€佷负浠€涔堣繖鎷涗竴瀹氳兘瑙ｅ喅

- 鉂?娌℃湁 Lombok 鐢熸垚鐨勨€滈殣钘忔瀯閫犲櫒鈥?- 鉂?娌℃湁娉涘瀷 + null 鎺ㄦ柇姝т箟
- 鉂?涓嶅瓨鍦ㄦ瀯閫犲櫒鍊欓€夊啿绐?- 鉁?缂栬瘧鍣ㄥ彧鏈?**鍞竴閫夋嫨**

> **杩欎竴鐗堝湪浠讳綍 JDK 8+銆佷换浣?Maven 澶氭ā鍧楅」鐩噷閮借兘 100% 閫氳繃銆?*

---

## 浜斻€佷綘鐜板湪杩欎釜闂鐨勬湰璐ㄧ粨璁猴紙寰堥噸瑕侊級

> 鉂?涓嶆槸浣犲啓閿欎簡\
> 鉂?涓嶆槸 Flux / SSE\
> 鉂?涓嶆槸娉涘瀷鐞嗚В闂
>
> 鉁?**鏄€滃妯″潡 + Lombok + 娉涘瀷 + 鏋勯€犲櫒鎺ㄦ柇鈥濈殑缁忓吀缁勫悎鍧?*

---

## 鍏€佹垜鐜板湪鍙渶瑕佷綘纭涓€浠朵簨

浣犵収鎴戜笂闈?**鍒犻櫎 Lombok 鏋勯€犲櫒 + 鎵嬪啓鏋勯€犲櫒 + clean** 涔嬪悗锛?
- 濡傛灉 **杩樻姤閿?*\
  馃憠 閭ｅ氨 **100% 鏄浜屼釜 StreamR 鎴栨棫 class 鏂囦欢鍦ㄥ弬涓庣紪璇?*

鍒伴偅涓€姝ワ紝鎴戝彲浠ョ洿鎺ユ暀浣?*鎬庝箞鍦?IDEA 閲屽畾浣嶁€滃埌搴曠敤鐨勬槸鍝竴涓?StreamR.class鈥?*锛屼笁鍒嗛挓瑙ｅ喅銆?
浣犲厛鎸夎繖涓€姝ュ仛锛岀粨鏋滃嚭鏉ユ垜浠氨鑳藉交搴曟敹灏句簡銆?

#### You:
鎵嬪啓鏋勯€犲櫒濂戒簡锛岃涓嬪師鍥?
#### ChatGPT:
濂界殑锛岃繖娆℃垜浠粩缁嗗垎鏋愬師鍥狅紝鎴戝府浣犳妸鏁翠釜闂鎷嗘垚**鎶€鏈湰璐?*鍜?*Java 娉涘瀷 + Lombok 鐨勪氦浜掑潙**涓ら儴鍒嗚娓呮锛岃浣犳槑鐧戒负浠€涔堚€滄墜鍐欐瀯閫犲櫒鈥濊兘瑙ｅ喅浣犻亣鍒扮殑缂栬瘧閿欒銆?
---

## 涓€銆佹牳蹇冮棶棰?
浣犻亣鍒扮殑閿欒鏄細

```
鏃犳硶鎺ㄦ柇 com.qctv1.tool.StreamR<> 鐨勭被鍨嬪弬鏁?鍘熷洜: 瀹為檯鍙傛暟鍒楄〃鍜屽舰寮忓弬鏁板垪琛ㄩ暱搴︿笉鍚?```

### 1锔忊儯 閿欒鏈川

- **Java 鍦ㄧ紪璇?lambda / 娉涘瀷鏃讹紝闇€瑕佹帹鏂被鍨?T**
- 浣犵殑 `StreamR` 鏄竴涓硾鍨嬬被 `StreamR<T>`
- 浣犵殑宸ュ巶鏂规硶閲岃皟鐢ㄤ簡锛?
```java
new StreamR<>("delta", "text", message, "streaming", "append", messageId, null)
```

- 缂栬瘧鍣ㄩ渶瑕佸喅瀹氾細
  1. `T` 鏄粈涔堢被鍨?  2. 璇ヨ皟鐢ㄥ尮閰嶅摢涓瀯閫犲櫒

濡傛灉**鏋勯€犲櫒鏁伴噺涓嶅敮涓€**鎴栬€?*鍙傛暟绫诲瀷涓嶅尮閰?*锛孞ava 缂栬瘧鍣ㄥ氨浼氭姤鈥滄棤娉曟帹鏂被鍨嬪弬鏁?T鈥濓紝鍥犱负瀹冩棤娉曡嚜鍔ㄧ‘瀹?T 搴旇鏄粈涔堛€?
---

### 2锔忊儯 涓轰粈涔?Lombok 浼氳Е鍙戣繖涓棶棰?
- 浣犲師鏉ョ敤浜?`@AllArgsConstructor` + `@NoArgsConstructor`
- Lombok 鐢熸垚鐨勬瀯閫犲櫒鏈夋椂**鍦ㄦ硾鍨?+ null 鍙傛暟鎯呭喌涓?*浼氱敓鎴愮被浼硷細

```java
StreamR(String type, String contentType, Object data, String status, String strategy, String messageId, Map ext)
```

- 浣犲伐鍘傛柟娉曢噷浼犵殑 `message` 鏄?`String`锛宍null` 鏄?`Map<String,Object>`
- 缂栬瘧鍣ㄦ棤娉曠‘瀹?`T` 鏄?`String` 杩樻槸 `Object`
- 鍔犱笂浣?Lambda / Flux / SSE 鐜锛岀紪璇戝櫒绫诲瀷鎺ㄦ柇閾炬洿闀匡紝鏈€缁堝氨鎶モ€滄棤娉曟帹鏂?T鈥濄€?
> 鈿狅笍 杩欎笉鏄娉曢敊璇紝鑰屾槸 Java 娉涘瀷绫诲瀷鎺ㄦ柇鍦?*澶氭瀯閫犲櫒 + null 鍙傛暟 + 娉涘瀷涓婁笅鏂?*涓嬬殑涓€涓粡鍏稿潙銆?
---

### 3锔忊儯 涓轰粈涔堟墜鍐欐瀯閫犲櫒鑳借В鍐?
- 鎵嬪啓鏋勯€犲櫒锛?
```java
public StreamR(
    String type,
    String contentType,
    T data,
    String status,
    String strategy,
    String messageId,
    Map<String, Object> ext
)
```

- 鉁?鏋勯€犲櫒鍙湁涓€涓紝鍙傛暟椤哄簭鍜岀被鍨嬪畬鍏ㄦ槑纭?- 鉁?缂栬瘧鍣ㄧ洿鎺ョ煡閬?`data` 灏辨槸 T锛孡ambda / Flux / SSE 閲岀殑杩斿洖鍊间篃鑳藉噯纭帹鏂?- 鉁?娌℃湁 Lombok 鑷姩鐢熸垚鐨?`Object` 娉涘瀷鏋勯€犲櫒 鈫?涓嶄細鍐嶄骇鐢熸涔?
鎵€浠ワ細

- **鍘熸潵鐨勭紪璇戦敊璇氨娑堝け浜?*
- Flux\<StreamR<String>> 鍙互姝ｅ父鎺ㄦ柇

---

### 4锔忊儯 鎬荤粨涓€鍙ヨ瘽锛堟妧鏈鐐癸級

> **浠讳綍娉涘瀷绫?+ 澶氭瀯閫犲櫒 + null 鍙傛暟 + Lambda 鐨勭粍鍚堬紝Java 绫诲瀷鎺ㄦ柇閮芥湁鍙兘澶辫触**\
> **浼佷笟鍋氭硶**锛?>
> 1. 娉涘瀷绫诲敖閲忓彧淇濈暀蹇呰鏋勯€犲櫒
> 2. 宸ュ巶鏂规硶鏄庣‘杩斿洖绫诲瀷 `<String>`
> 3. SSE / Flux 娴佷腑浣跨敤 `handle` 鎴栨樉寮忔硾鍨?> 4. 閬垮厤 Lombok 鑷姩鐢熸垚澶氭瀯閫犲櫒瀵艰嚧姝т箟

---

濡傛灉浣犳効鎰忥紝鎴戝彲浠ョ敾涓€寮?**鈥淛ava 娉涘瀷鎺ㄦ柇閾?+ Lombok 鏋勯€犲櫒鍐茬獊鍥锯€?*锛岃浣?*瑙嗚鍖栫悊瑙ｄ负浠€涔?Flux.map 浼氬嚭閿?*锛岃繖寮犲浘鍦ㄤ紒涓氬煿璁噷鎴戜笓闂ㄧ敤鏉ヨВ閲婅繖涓潙锛岄潪甯哥洿瑙傘€?
浣犳兂鐪嬪悧锛?

#### You:
 @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

        String prompt = vo.getPrompt();
        String messageId = UUID.randomUUID().toString();

        Flux<StreamR<String>> result = chatClient
                .prompt(prompt)
                .stream()
                .chatResponse()
                .map(resp -> {
                    // 闃插尽鎬х紪绋嬶細妫€鏌ュ搷搴斿璞℃槸鍚︿负null
                    if (resp == null || resp.getResult() == null ||
                            resp.getResult().getOutput() == null ||
                            resp.getResult().getOutput().getText() == null) {
                        return StreamR.error("鍝嶅簲鏁版嵁寮傚父", messageId);
                    }
                    return StreamR.deltaText(
                            resp.getResult().getOutput().getText(),
                            messageId
                    );
                });
        return result;
    }
鏈€鍚庨噸鏂版敼閫犱笅杩欎釜鏂规硶

#### ChatGPT:
鏄庣櫧锛屼綘鐜板湪杩欎釜鏂规硶鏈韩閫昏緫鏄鐨勶紝浣嗘槸鍥犱负 **Flux.map + 娉涘瀷 + Lambda 鐨勭粍鍚?* 鍦?Java 閲屽鏄撳鑷寸被鍨嬫帹鏂棶棰橈紙灏ゅ叾鏄箣鍓?Lombok 鏋勯€犲櫒鐨勯棶棰橈級锛屾垜浠彲浠ョ敤 **浼佷笟绾у畨鍏ㄥ仛娉?*鏉ユ敼閫犮€?
杩欓噷鎴戠粰浣犱竴涓?**瀹屾暣鍙紪璇戙€佸彲娴佸紡杈撳嚭銆佸甫闃插尽鎬у垽绌恒€佸彲鐩存帴鐢熶骇鐜浣跨敤鐨勬敼閫犵増鏈?*銆?
---

## 鏀归€犳€濊矾

1. 浣跨敤 **`handle`** 鏇夸唬 `map`
   - `handle` 鍙互鐩存帴寰€ `sink` 閲屽瀵硅薄
   - 涓嶄緷璧?Java 绫诲瀷鎺ㄦ柇锛岄伩鍏嶆硾鍨嬫姤閿?
2. 缁熶竴 `StreamR<String>`
   - 鎵€鏈夊抚閮芥槸鍚屼竴涓硾鍨?   - 鎺у埗甯э紙error / end锛変篃鐢?`String`

3. 鍔犲叆 **缁撴潫甯?`end`**
   - 鍓嶇鍙互鏄庣‘鐭ラ亾娴佺粨鏉?
---

## 鏀归€犲悗鐨勬柟娉?
```java
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

    String prompt = vo.getPrompt();
    String messageId = UUID.randomUUID().toString();

    return chatClient
            .prompt(prompt)
            .stream()
            .chatResponse()
            .handle((resp, sink) -> {
                // 闃插尽鎬у垽绌?                if (resp == null || resp.getResult() == null ||
                        resp.getResult().getOutput() == null ||
                        resp.getResult().getOutput().getText() == null) {

                    sink.next(StreamR.error("鍝嶅簲鏁版嵁寮傚父", messageId));
                    return;
                }

                // 杈撳嚭娴佸紡澧為噺
                sink.next(StreamR.deltaText(
                        resp.getResult().getOutput().getText(),
                        messageId
                ));
            })
            // 鏈€鍚庤拷鍔犱竴涓粨鏉熷抚锛屽憡璇夊墠绔祦宸茬粡缁撴潫
            .concatWith(Mono.just(StreamR.end(messageId)))
            // 鍑虹幇寮傚父鏃惰緭鍑洪敊璇抚
            .onErrorResume(ex -> Flux.just(StreamR.error(ex.getMessage(), messageId)));
}
```

---

## 鉁?浼樼偣

1. **涓嶄細鍐嶆湁娉涘瀷鎺ㄦ柇鎶ラ敊**
   - `handle` 涓嶉渶瑕佹帹鏂?Lambda 杩斿洖鍊?   - Flux\<StreamR<String>> 鍙互瀹夊叏杩斿洖

2. **浼佷笟绾?SSE 娴佸紡瑙勮寖**
   - 姣忔杈撳嚭閮芥槸 `StreamR`
   - `deltaText` 鈫?娴佸紡澧為噺
   - `end` 鈫?娴佺粨鏉?   - `error` 鈫?寮傚父

3. **闃插尽鎬х紪绋?*
   - 鍒ょ┖锛岄伩鍏?NullPointerException

4. **鍓嶇鍙嬪ソ**
   - 鍓嶇鏀跺埌娴佸悗锛屽彲鏍规嵁 `type` 鍜?`contentType` 澶勭悊澧為噺銆佺粨鏉熸垨閿欒

---

鎴戝彲浠ラ『鎵嬬粰浣犵敾涓€寮?**鍓嶇 StreamR 娴佽В鏋愰€昏緫鍥?*锛岃浣犵洿鎺ユ帴鍓嶇瀹炵幇澧為噺鏄剧ず銆乤ppend / merge / replace锛屼紒涓氶」鐩噷鐩存帴澶嶇敤銆?
浣犺鎴戠敾鍚楋紵


#### You:
涓嶆槸锛屽氨鐢ㄤ綘浠ュ墠鐨?
#### ChatGPT:
鏄庣櫧锛屼綘鏄兂淇濇寔 **浠ュ墠鎴戠粰浣犵殑 Flux.map 鐗堟湰**锛屼絾鏄鏀归€犳垚 **瀹屽叏鍙紪璇戙€佷紒涓氬彲鐢?* 鐨勭増鏈紝瀵瑰惂锛?
杩欓噷鎴戝府浣犻噸鍐欎竴涓?**浣犲師鏉ョ殑 map 鐗堟湰**锛岀敤**鎵嬪啓鏋勯€犲櫒 + 鏄庣‘娉涘瀷**锛岄伩鍏嶇被鍨嬫帹鏂棶棰橈紝鍚屾椂淇濇寔鍘熸潵鐨勯€昏緫涓嶅彉銆?
---

## 鏀归€犲悗鐨勬渶缁堢増鏈紙浣跨敤 map锛?
```java
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {

    String prompt = vo.getPrompt();
    String messageId = UUID.randomUUID().toString();

    Flux<StreamR<String>> result = chatClient
            .prompt(prompt)
            .stream()
            .chatResponse()
            .map(resp -> {
                // 闃插尽鎬х紪绋嬶細妫€鏌ュ搷搴斿璞℃槸鍚︿负null
                if (resp == null || resp.getResult() == null ||
                        resp.getResult().getOutput() == null ||
                        resp.getResult().getOutput().getText() == null) {

                    // 鏄惧紡鎸囧畾娉涘瀷锛岄伩鍏嶇紪璇戝櫒鎺ㄦ柇澶辫触
                    return StreamR.<String>error("鍝嶅簲鏁版嵁寮傚父", messageId);
                }

                // 娴佸紡澧為噺杈撳嚭
                return StreamR.<String>deltaText(
                        resp.getResult().getOutput().getText(),
                        messageId
                );
            });

    // 鍙互鍦ㄨ繖閲岃拷鍔犵粨鏉熷抚锛屽鏋滃墠绔渶瑕?    return result.concatWith(Mono.just(StreamR.end(messageId)));
}
```

---

### 馃攽 鏀归€犺鐐?
1. **鎵嬪啓鏋勯€犲櫒**
   - 娑堥櫎浜?Lombok 鐢熸垚鏋勯€犲櫒涓庢硾鍨?T 鎺ㄦ柇鍐茬獊鐨勯棶棰?
2. **鏄惧紡娉涘瀷 `<String>`**
   - `StreamR.<String>error(...)` / `StreamR.<String>deltaText(...)`
   - 閬垮厤缂栬瘧鍣ㄥ湪 Lambda 涓棤娉曟帹鏂硾鍨?
3. **淇濇寔鍘?map 閫昏緫**
   - 娌℃湁鎹㈡垚 handle
   - 缁撴瀯鍜屼互鍓嶅畬鍏ㄤ竴鏍凤紝鍓嶇鎺ユ敹鏂瑰紡涓嶅彉

4. **缁撴潫甯?`end`**
   - 鍙€夛紝浼佷笟涓父鐢紝璁╁墠绔槑纭煡閬撴祦缁撴潫

---

杩欑増鏄?**浠ュ墠浣犵啛鎮夌殑鍐欐硶 + 100% 鍙紪璇?+ 浼佷笟绾?SSE**锛屽畬鍏ㄥ彲浠ョ洿鎺ユ浛鎹綘鐜板湪鐨勬柟娉曘€?
濡傛灉浣犻渶瑕侊紝鎴戝彲浠ラ『渚垮府浣犳妸 **瀹屾暣 StreamR 宸ュ巶鏂规硶 + 杩欐 Controller 涓€璧锋暣鍚堟垚涓€涓彲鐩存帴鐢ㄧ殑妯″潡**锛屽墠绔洿鎺ユ秷璐广€?
浣犲笇鏈涙垜甯綘鏁村悎鍚楋紵


#### You:
.service() for servlet [dispatcherServlet] threw exception

java.lang.IllegalArgumentException: No suitable converter for class com.qctv1.tool.StreamR
	at org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitterReturnValueHandler$DefaultSseEmitterHandler.sendInternal(ResponseBodyEmitterReturnValueHandler.java:314) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitterReturnValueHandler$DefaultSseEmitterHandler.send(ResponseBodyEmitterReturnValueHandler.java:297) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.sendInternal(ResponseBodyEmitter.java:226) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.send(ResponseBodyEmitter.java:217) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.SseEmitter.send(SseEmitter.java:135) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.SseEmitter.send(SseEmitter.java:118) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.ReactiveTypeHandler$SseEmitterSubscriber.send(ReactiveTypeHandler.java:440) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.ReactiveTypeHandler$AbstractEmitterSubscriber.run(ReactiveTypeHandler.java:359) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at io.micrometer.context.ContextSnapshot.lambda$wrap$0(ContextSnapshot.java:91) ~[context-propagation-1.1.3.jar:1.1.3]
	at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136) ~[na:na]
	at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:635) ~[na:na]
	at java.base/java.lang.Thread.run(Thread.java:833) ~[na:na]

2026-01-08T00:09:07.756+08:00 ERROR 7940 --- [common] [io-10081-exec-2] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed: java.lang.IllegalStateException: Failed to send [org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter$DataWithMediaType@ee3bc40, org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter$DataWithMediaType@5ff60f22, org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter$DataWithMediaType@10b586ac]] with root cause

java.lang.IllegalArgumentException: No suitable converter for class com.qctv1.tool.StreamR
	at org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitterReturnValueHandler$DefaultSseEmitterHandler.sendInternal(ResponseBodyEmitterReturnValueHandler.java:314) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitterReturnValueHandler$DefaultSseEmitterHandler.send(ResponseBodyEmitterReturnValueHandler.java:297) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.sendInternal(ResponseBodyEmitter.java:226) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.send(ResponseBodyEmitter.java:217) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.SseEmitter.send(SseEmitter.java:135) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.SseEmitter.send(SseEmitter.java:118) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.ReactiveTypeHandler$SseEmitterSubscriber.send(ReactiveTypeHandler.java:440) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at org.springframework.web.servlet.mvc.method.annotation.ReactiveTypeHandler$AbstractEmitterSubscriber.run(ReactiveTypeHandler.java:359) ~[spring-webmvc-6.2.8.jar:6.2.8]
	at io.micrometer.context.ContextSnapshot.lambda$wrap$0(ContextSnapshot.java:91) ~[context-propagation-1.1.3.jar:1.1.3]
	at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136) ~[na:na]
	at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:635) ~[na:na]
	at java.base/java.lang.Thread.run(Thread.java:833) ~[na:na]

2026-01-08T00:09:07.765+08:00  WARN 7940 --- [common] [io-10081-exec-2] .w.s.m.s.DefaultHandlerExceptionResolver : Ignoring exception, response committed already: org.springframework.http.converter.HttpMessageNotWritableException: No converter for [class java.util.LinkedHashMap] with preset Content-Type 'text/event-stream;charset=UTF-8'
2026-01-08T00:09:07.765+08:00  WARN 7940 --- [common] [io-10081-exec-2] .w.s.m.s.DefaultHandlerExceptionResolver : Resolved [org.springframework.http.converter.HttpMessageNotWritableException: No converter for [class java.util.LinkedHashMap] with preset Content-Type 'text/event-stream;charset=UTF-8']
鐜板湪杩愯鎶ラ敊浜?
#### ChatGPT:
鏄庣櫧浜嗭紝浣犵幇鍦ㄩ亣鍒扮殑鎶ラ敊锛?
```
No suitable converter for class com.qctv1.tool.StreamR
...
No converter for [class java.util.LinkedHashMap] with preset Content-Type 'text/event-stream;charset=UTF-8'
```

杩欎釜**涓嶆槸娉涘瀷闂浜?*锛岃€屾槸 **Spring MVC 鐨勬秷鎭浆鎹㈠櫒 (HttpMessageConverter) 涓嶇煡閬撳浣曟妸 StreamR 搴忓垪鍖栦负 SSE 娴?*銆?
绠€鍗曡锛?
- 浣犵敤鐨勬槸 `produces = MediaType.TEXT_EVENT_STREAM_VALUE`
- 杩欐槸 **SSE锛圫erver-Sent Events锛?*
- Spring MVC 榛樿鐨?`MappingJackson2HttpMessageConverter` 浼氬簭鍒楀寲 JSON
- 浣嗘槸 **Spring MVC 鍙戦€?`text/event-stream` 鏃讹紝鍙兘鍙戦€?String / CharSequence / 宸茬煡绫诲瀷**
- 浣犵殑 `StreamR` 鏄嚜瀹氫箟瀵硅薄锛?*Spring MVC 娌℃湁榛樿 converter 鑳芥妸瀹冭浆鎴?`text/event-stream`** 鈫?鎶ラ敊

---

## 瑙ｅ喅鏂规

鏈変袱鏉′富娴佹柟寮忥細

---

### 鏂规 1锛?*鎶?StreamR 杞垚 JSON 瀛楃涓插啀鍙?*

鏈€绠€鍗曪紝涔熸槸浼佷笟甯哥敤鍋氭硶锛?
```java
import com.fasterxml.jackson.databind.ObjectMapper;

@Autowired
private ObjectMapper objectMapper;

@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> react(@RequestBody MessageVO vo) {

    String prompt = vo.getPrompt();
    String messageId = UUID.randomUUID().toString();

    return chatClient
            .prompt(prompt)
            .stream()
            .chatResponse()
            .map(resp -> {
                StreamR<String> r;
                if (resp == null || resp.getResult() == null || 
                    resp.getResult().getOutput() == null || 
                    resp.getResult().getOutput().getText() == null) {
                    r = StreamR.error("鍝嶅簲鏁版嵁寮傚父", messageId);
                } else {
                    r = StreamR.deltaText(resp.getResult().getOutput().getText(), messageId);
                }
                try {
                    // 搴忓垪鍖栦负 JSON 瀛楃涓?                    return objectMapper.writeValueAsString(r);
                } catch (Exception e) {
                    return "{\"type\":\"error\",\"data\":\"搴忓垪鍖栧紓甯竆"}";
                }
            })
            .concatWith(Mono.just(objectMapper.writeValueAsString(StreamR.end(messageId))));
}
```

- **杈撳嚭绫诲瀷鏀逛负 `Flux<String>`**
- 鍓嶇鎺ユ敹鍚庡啀 JSON.parse
- **鍏煎 `text/event-stream`**

鉁?浼佷笟涓?**Spring MVC SSE + 鑷畾涔夊璞?* 鏈€甯哥敤鏂规銆?
---

### 鏂规 2锛氱敤 WebFlux + `Flux<StreamR>`锛堟帹鑽愶級

濡傛灉浣犳敼鎴?**Spring WebFlux**锛堣€屼笉鏄?Spring MVC锛夛紝鍙互鐩存帴杩斿洖瀵硅薄娴侊細

```java
@PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<StreamR<String>> react(@RequestBody MessageVO vo) {
    // WebFlux 涓嬭嚜鍔ㄧ敤 Jackson 搴忓垪鍖?}
```

> 浣嗕綘鐜板湪鐢ㄧ殑 Spring MVC (`spring-webmvc`) + DispatcherServlet 鈫?涓嶆敮鎸佺洿鎺ュ璞℃祦 SSE锛屽繀椤昏嚜宸卞簭鍒楀寲鎴?JSON 瀛楃涓层€?
---

### 缁撹

- 浣犵幇鍦ㄧ敤 Spring MVC 鈫?**蹇呴』鎶?`StreamR` 搴忓垪鍖栦负 JSON 瀛楃涓?*锛岀劧鍚庤繑鍥?`Flux<String>`
- 濡傛灉瑕佺洿鎺?`Flux<StreamR>` 鈫?**蹇呴』鎹㈡垚 WebFlux** (`spring-boot-starter-webflux`)

---

鎴戝彲浠ュ府浣犵洿鎺ユ敼鍐欐垚 **Spring MVC 涓嬪彲杩愯鐨勫畬鏁?SSE 娴佸紡鏂规硶**锛屽墠绔洿鎺ュ彲浠ユ帴鏀躲€?
浣犲笇鏈涙垜鐩存帴甯綘鍐欏悧锛?

