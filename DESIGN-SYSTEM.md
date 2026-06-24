# AONE GLAMPING VILLA — Design System

施設の世界観（標高800mの森・朝靄・焚き火・一棟貸しの静けさ）から導いたトークン集。
ポートフォリオ用デモ兼、今後の案件で使い回せる土台。

## コンセプト
- **和エディトリアル × 自然**。深い森の緑を主役に、紙のような余白で「静けさ」を出す。
- 派手さは1点だけ（焚き火色 Ember を合計金額とアクセントにのみ使う）。あとは徹底して静かに。
- **シグネチャー＝等高線（contour）モチーフ**。標高800mの森という事実を線で表現し、ヒーローと予約サマリーに反復。

## Color tokens
| 名前 | hex | 用途 |
|---|---|---|
| `--paper` | `#EFEEE6` | 背景（温かみのある靄色の紙） |
| `--card` | `#F8F7F1` | カード面 |
| `--forest` | `#20302A` | 主役の深緑。文字・ダークセクション |
| `--forest-2` | `#2C4034` | 深緑の明るい方（ヒーロー等高線・境界） |
| `--sage` | `#7C8A77` | 副次テキスト・補助 |
| `--ember` | `#BC5A2C` | 焚き火色アクセント（合計金額・選択・CTAホバーのみ） |
| `--line` | `#D7D3C6` | ヘアライン罫線 |

## Type
- **Display**：Shippori Mincho（明朝）— 見出し。craft／自然／静けさ。多用しない。
- **Body**：Zen Kaku Gothic New — 本文。クリアで温かいゴシック。
- **Utility/Data**：Space Mono — 座標・標高・ラベル等の「計器」表現。
- スケール：display clamp(30→52px) / h2 20px / body 15.5px / small 13px / micro 11.5px(tracking +.18em)

## Spacing & shape
- スペース基準：8px グリッド（8 / 16 / 24 / 40 / 64）
- 角丸：`--r:4px`（小）/ `--r-lg:10px`（カード）。丸めすぎない＝硬質で上質に。
- 罫線：1px solid `--line`。影は最小（`0 1px 0` 程度）。フラット寄り。

## Motion
- ヒーローの等高線をロード時にゆっくりドロー（1回だけ）。
- ホバーは2px持ち上げ＋境界色のみ。過剰な動きは入れない。
- `prefers-reduced-motion` 尊重。

## Components
- Plan card：未選択=ヘアライン / 選択=forest境界＋sage薄塗り＋ember tick。
- Input：白地・ヘアライン・focusでforest境界。エラーはember。
- Summary（STAY CARD）：forestダーク地に等高線を薄く敷き、合計のみember。
- CTA：forest塗り＋paper文字。hoverでember下線。
