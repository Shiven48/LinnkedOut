import {
  PipelineStageResult,
  YoutubeMetadata,
  QualityMetrics,
  YTStatsAndTopics,
  YTVideoSnippet,
  ScoreExtractionResult,
  FilteringStage,
} from "@/services/common/types";
import { YoutubeMetadataSevice } from "./YoutubeMetadataService";
import { clickbaitKeywords, qualityKeywords } from "@/services/common/constants";

export class YoutubeFilterService {
  private youtubeMetadataService: YoutubeMetadataSevice;

  constructor() {
    this.youtubeMetadataService = new YoutubeMetadataSevice();
  }

  public processVideos(rawVideos: YoutubeMetadata[]): ScoreExtractionResult[] {
    try {
      const filteringPipelineResult:PipelineStageResult = this.removeDuplicateVideos(rawVideos);
      const {inputCount, outputCount, filteringReason, stage} = filteringPipelineResult;
      console.log(`Filtered a total of ${inputCount - outputCount} videos from ${inputCount} videos, Remaining videos: ${outputCount}`);
      if(filteringReason){
        console.log(`Stage: ${stage} filtered videos for ${filteringReason} reason`);
      }

      const uniqueVideos = filteringPipelineResult.videos;
      if (uniqueVideos.length < 1) {
        throw new Error(
          `Critical shortage: Only ${uniqueVideos.length} unique videos, need minimum 9`
        );
      }

      const targetCount = this.determineTargetCount(uniqueVideos.length);
      const videoStats: ScoreExtractionResult[] = uniqueVideos
        .map((video: YoutubeMetadata) => {
          const stats: YTStatsAndTopics =
            this.youtubeMetadataService.extractStats(video);
          const qualityMetrics: QualityMetrics = this.extractQualityMetrics(
            stats,
            video
          );
          qualityMetrics.qualityScore = this.calculateQualityScore(
            qualityMetrics,
            video.snippet
          );
          return {
            metrics: qualityMetrics,
            video: video,
          };
        })
        .sort((a, b) => b.metrics.qualityScore - a.metrics.qualityScore);

      const candidateMultiplier = targetCount === 12 ? 2.5 : 3;
      const candidateCount = Math.min(
        Math.ceil(targetCount * candidateMultiplier),
        videoStats.length
      );

      return videoStats.slice(0, candidateCount);
    } catch (error) {
      console.error("Pipeline Error:", error);
      throw error;
    }
  }

  private removeDuplicateVideos(
    videos: YoutubeMetadata[]
  ): PipelineStageResult {
    const uniqueVideos = new Map<string, YoutubeMetadata>();

    videos.forEach((video: YoutubeMetadata) => {
      if (!uniqueVideos.has(video.id)) {
        uniqueVideos.set(video.id, video);
      }
      console.log(`Removed video with id:${video.id}`);
    });

    const FilteredUniqueVideos: YoutubeMetadata[] = Array.from(uniqueVideos.values());

    return {
      videos: FilteredUniqueVideos,
      stage: FilteringStage.ID_DEDUPLICATION,
      inputCount: videos.length,
      outputCount: FilteredUniqueVideos.length,
      filteringReason: `Found ID duplicates from the fetched videos`,
    };
  }

  private determineTargetCount(availableVideos: number): 9 | 12 {
    return availableVideos >= 25 ? 12 : 9;
  }

  private extractQualityMetrics(
    stats: YTStatsAndTopics,
    metadata: YoutubeMetadata
  ): QualityMetrics {
    const { likeCount, viewCount, commentCount, favoriteCount } = stats;

    const likes = parseInt(likeCount);
    const views = parseInt(viewCount);
    const comments = parseInt(commentCount);
    const duration =
      this.youtubeMetadataService.parseDurationToMs(
        metadata.contentDetails.duration
      ) / 1000;

    const likeToViewRatio = views > 0 ? (likes / views) * 100 : 0;
    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
    const commentToLikeRatio = likes > 0 ? comments / likes : 0;
    return {
      likeToViewRatio,
      engagementRate,
      commentToLikeRatio,
      views,
      likes,
      comments,
      duration,
      qualityScore: 0,
    };
  }

  private calculateQualityScore(
    metrics: QualityMetrics,
    snippet: YTVideoSnippet
  ): number {
    let score = 0;

    // Engagement quality (40% weight)
    if (metrics.likeToViewRatio > 2) score += 20;
    else if (metrics.likeToViewRatio > 1) score += 15;
    else if (metrics.likeToViewRatio > 0.5) score += 10;

    if (metrics.engagementRate > 3) score += 20;
    else if (metrics.engagementRate > 1.5) score += 15;
    else if (metrics.engagementRate > 0.5) score += 10;

    // View count scaling (20% weight)
    if (metrics.views > 100000) score += 15;
    else if (metrics.views > 10000) score += 10;
    else if (metrics.views > 1000) score += 5;

    // Duration quality (20% weight) - favor 5-30 minute videos
    if (metrics.duration >= 300 && metrics.duration <= 1800) score += 20;
    else if (metrics.duration >= 180 && metrics.duration <= 3600) score += 15;
    else if (metrics.duration >= 120) score += 10;

    const title = snippet.title?.toLowerCase() || "";
    const description = snippet.description?.toLowerCase() || "";

    const qualityMatches = qualityKeywords.filter(
      (keyword) => title.includes(keyword) || description.includes(keyword)
    ).length;
    score += Math.min(qualityMatches * 5, 15);

    const clickbaitMatches = clickbaitKeywords.filter(
      (keyword) => title.includes(keyword) || description.includes(keyword)
    ).length;
    score -= clickbaitMatches * 10;

    return Math.max(0, Math.min(100, score));
  }
}
