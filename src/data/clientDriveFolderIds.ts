// 取引先ごとのGoogleドライブフォルダ（取引先コード→フォルダID）
// ここにフォルダIDを追加すると、取引先詳細ページから直接そのフォルダを開けるようになる
// フォルダIDはGoogleドライブでフォルダを開いた時のURLの https://drive.google.com/drive/folders/【ここ】 部分
export const clientDriveFolderIds: Record<string, string> = {}
