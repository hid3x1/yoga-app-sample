// PoseGuide.js - 視覚的ガイド生成クラスの実装サンプル

class PoseGuide {
  constructor(targetPose) {
    this.targetPose = targetPose;
    this.userKeyPoints = null;
    this.alignmentStatus = {}; // ポイントごとの合わせ状態
    this.guideOpacity = 0.6;   // ガイドの透明度
    
    // 色定義
    this.colors = {
      silhouette: '#4FC3F7',
      correct: '#4CAF50',
      needsAdjustment: '#FFC107',
      incorrect: '#F44336'
    };
    
    // シルエット画像の読み込み
    this.silhouetteImage = new Image();
    this.silhouetteImage.src = targetPose.silhouetteUrl;
  }
  
  // ユーザーの姿勢データを更新
  updateUserKeyPoints(detectedKeyPoints) {
    this.userKeyPoints = detectedKeyPoints;
    this.updateAlignmentStatus();
  }
  
  // アライメント状態を更新（内部計算）
  updateAlignmentStatus() {
    if (!this.userKeyPoints) return;
    
    // 各ガイダンスポイントについて状態を評価
    this.targetPose.guidancePoints.forEach(point => {
      const keypoint = point.keypoint;
      const userPoint = this.userKeyPoints.find(p => p.name === keypoint);
      const targetPoint = this.targetPose.keyPoints.find(p => p.name === keypoint);
      
      if (userPoint && targetPoint) {
        // 位置の差異を計算
        const distance = this.calculateDistance(userPoint.position, targetPoint.targetPosition);
        
        // 重要度に基づいた許容範囲
        const tolerance = point.importance === 'high' ? 0.05 : 
                          point.importance === 'medium' ? 0.1 : 0.15;
        
        // 状態判定
        if (distance < tolerance) {
          this.alignmentStatus[keypoint] = 'correct';
        } else if (distance < tolerance * 2) {
          this.alignmentStatus[keypoint] = 'needsAdjustment';
        } else {
          this.alignmentStatus[keypoint] = 'incorrect';
        }
      }
    });
  }
  
  // 二点間の距離を計算
  calculateDistance(point1, point2) {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // キャンバスに視覚的ガイドを描画
  drawVisualGuide(ctx, width, height) {
    // 1. シルエットを描画
    ctx.globalAlpha = this.guideOpacity;
    ctx.drawImage(this.silhouetteImage, 0, 0, width, height);
    
    // 2. アライメントポイントを描画（ユーザーの骨格は描画しない）
    if (this.userKeyPoints) {
      this.targetPose.guidancePoints.forEach(point => {
        const keypoint = point.keypoint;
        const userPoint = this.userKeyPoints.find(p => p.name === keypoint);
        const targetPoint = this.targetPose.keyPoints.find(p => p.name === keypoint);
        
        if (userPoint && targetPoint) {
          // 目標位置にポイントを描画
          const status = this.alignmentStatus[keypoint] || 'needsAdjustment';
          const color = this.colors[status];
          const size = point.visualSize || 15;
          
          const x = targetPoint.targetPosition[0] * width;
          const y = targetPoint.targetPosition[1] * height;
          
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          
          // 方向矢印の表示（状態が「incorrect」の場合のみ）
          if (status === 'incorrect') {
            this.drawDirectionArrow(
              ctx, 
              userPoint.position[0] * width, 
              userPoint.position[1] * height,
              x, y, 
              color,
              size
            );
          }
        }
      });
    }
    
    ctx.globalAlpha = 1.0; // 透明度をリセット
  }
  
  // 修正方向を示す矢印を描画
  drawDirectionArrow(ctx, fromX, fromY, toX, toY, color, size) {
    // 方向と距離を計算
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 距離が近すぎる場合は矢印を描画しない
    if (distance < size * 2) return;
    
    // 矢印の長さと方向を正規化
    const arrowLength = Math.min(distance * 0.5, 40);
    const dirX = dx / distance;
    const dirY = dy / distance;
    
    // 矢印の先端位置
    const tipX = fromX + dirX * arrowLength;
    const tipY = fromY + dirY * arrowLength;
    
    // 矢印を描画
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 矢印の先端
    const headSize = 10;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
      tipX - headSize * Math.cos(angle - Math.PI / 6),
      tipY - headSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      tipX - headSize * Math.cos(angle + Math.PI / 6),
      tipY - headSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  // ガイドの透明度を設定
  setOpacity(opacity) {
    this.guideOpacity = Math.max(0, Math.min(1, opacity));
  }
}

export default PoseGuide;
